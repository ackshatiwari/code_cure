import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { modelAnalysisSchema } from "@/lib/schemas/analysis";
import type { LiveConfig } from "./config";

export type ProviderErrorCode =
  | "timeout"
  | "cancelled"
  | "provider_rate_limited"
  | "provider_unavailable"
  | "provider_auth"
  | "provider_rejected";

export class ProviderError extends Error {
  constructor(public code: ProviderErrorCode) {
    super(code);
    this.name = "ProviderError";
  }
}

export interface ProviderMessage {
  role: "user" | "assistant";
  content: string;
}

export type ProviderOutput =
  | { kind: "ok"; text: string }
  | { kind: "declined" }
  | { kind: "truncated" };

/** The analysis call only needs text in, text out; tests inject a fake. */
export interface AnalysisProvider {
  generate(req: { system: string; messages: ProviderMessage[]; signal: AbortSignal }): Promise<ProviderOutput>;
}

const outputFormat = betaZodOutputFormat(modelAnalysisSchema);

export function createAnthropicProvider(config: LiveConfig): AnalysisProvider {
  const client = new Anthropic({ apiKey: config.apiKey ?? undefined, maxRetries: 1, timeout: config.timeoutMs });
  return {
    async generate({ system, messages, signal }) {
      try {
        // No tools are passed, so the model cannot browse, fetch URLs or run code.
        // `fallbacks: "default"` lets the API retry a policy decline on its recommended
        // fallback model; on models without fallback support the request runs alone.
        const response = await client.beta.messages.create(
          {
            model: config.model,
            max_tokens: 16000,
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
            output_config: { effort: config.effort, format: outputFormat },
            system,
            messages,
          },
          { signal, timeout: config.timeoutMs },
        );
        if (response.stop_reason === "refusal") return { kind: "declined" };
        if (response.stop_reason === "max_tokens") return { kind: "truncated" };
        const text = response.content
          .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
          .map((b) => b.text)
          .join("");
        return { kind: "ok", text };
      } catch (error) {
        if (error instanceof Anthropic.APIUserAbortError) {
          throw new ProviderError(signal.reason === "timeout" ? "timeout" : "cancelled");
        }
        if (error instanceof Anthropic.APIConnectionTimeoutError) throw new ProviderError("timeout");
        if (error instanceof Anthropic.RateLimitError) throw new ProviderError("provider_rate_limited");
        if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
          throw new ProviderError("provider_auth");
        }
        if (error instanceof Anthropic.BadRequestError || error instanceof Anthropic.NotFoundError) {
          throw new ProviderError("provider_rejected");
        }
        if (error instanceof Anthropic.APIError) throw new ProviderError("provider_unavailable");
        throw new ProviderError("provider_unavailable");
      }
    },
  };
}
