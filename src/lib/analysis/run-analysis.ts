import "server-only";
import type { DecoderAnalysis } from "@/lib/schemas/analysis";
import { ANALYSIS_SYSTEM_PROMPT, buildRepairMessage, buildUserMessage } from "./prompt";
import type { AnalysisProvider, ProviderMessage } from "./provider";
import { assembleAnalysis, validateModelAnalysis } from "./response-validation";
import type { SourceSentence } from "./source-segmentation";

export type RunResult =
  | { ok: true; analysis: DecoderAnalysis }
  | { ok: false; code: "invalid_response" | "provider_declined" };

function tryJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/**
 * One provider call, plus at most one controlled repair attempt when the output fails
 * validation. Provider errors (timeout, cancellation, outages) propagate to the caller.
 */
export async function runAnalysis(
  provider: AnalysisProvider,
  input: { sourceText: string; sentences: SourceSentence[]; userTitle: string | null },
  signal: AbortSignal,
): Promise<RunResult> {
  const messages: ProviderMessage[] = [{ role: "user", content: buildUserMessage(input.sentences, input.userTitle) }];

  for (let attempt = 0; attempt < 2; attempt++) {
    const out = await provider.generate({ system: ANALYSIS_SYSTEM_PROMPT, messages, signal });
    if (out.kind === "declined") return { ok: false, code: "provider_declined" };
    if (out.kind === "truncated") return { ok: false, code: "invalid_response" };

    const json = tryJson(out.text);
    const result =
      json === undefined ? { ok: false as const, problems: ["The output was not valid JSON."] } : validateModelAnalysis(json, input.sentences);
    if (result.ok) {
      return {
        ok: true,
        analysis: assembleAnalysis(result.analysis, {
          origin: "ai_generated",
          provenanceNote: null,
          userTitle: input.userTitle,
          sourceText: input.sourceText,
          sentences: input.sentences,
        }),
      };
    }
    if (attempt === 0) {
      messages.push({ role: "assistant", content: out.text || "{}" }, { role: "user", content: buildRepairMessage(result.problems) });
    }
  }
  return { ok: false, code: "invalid_response" };
}
