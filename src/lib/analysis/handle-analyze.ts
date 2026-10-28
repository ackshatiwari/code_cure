import "server-only";
import { z } from "zod";
import { checkLiveBudget, type RateLimiter } from "@/lib/rate-limit";
import type { LiveConfig } from "./config";
import {
  analyzeErrorMessages,
  analyzeErrorStatus,
  isUrlOnly,
  MAX_INPUT_CHARS,
  MAX_REQUEST_BYTES,
  MAX_TITLE_CHARS,
  type AnalyzeErrorCode,
} from "./errors";
import { ProviderError, type AnalysisProvider } from "./provider";
import { runAnalysis } from "./run-analysis";
import { normalizeInput, segmentSource } from "./source-segmentation";

export interface AnalyzeDeps {
  config: LiveConfig;
  limiter: RateLimiter;
  createProvider: (config: LiveConfig) => AnalysisProvider;
  now?: () => number;
}

const bodySchema = z.object({
  text: z.string(),
  title: z.string().max(MAX_TITLE_CHARS).optional().nullable(),
});

const NO_STORE = { "Cache-Control": "no-store" };

function errorResponse(code: AnalyzeErrorCode, extraHeaders: Record<string, string> = {}) {
  return Response.json(
    { ok: false, error: { code, message: analyzeErrorMessages[code] } },
    { status: analyzeErrorStatus[code], headers: { ...NO_STORE, ...extraHeaders } },
  );
}

async function readLimitedBody(request: Request): Promise<string | null> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_REQUEST_BYTES) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_REQUEST_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder().decode(all);
}

/**
 * Identity comes only from a header the hosting platform sets and that the operator
 * named in TRUSTED_CLIENT_ID_HEADER. Without one, every caller shares one bucket,
 * which is conservative rather than spoofable.
 */
function clientKey(request: Request, config: LiveConfig) {
  if (!config.trustedClientHeader) return "shared";
  const value = request.headers.get(config.trustedClientHeader)?.split(",")[0]?.trim();
  return value ? value.slice(0, 100) : "shared";
}

/**
 * Pasted text and generated analyses are never logged here. Errors are mapped to
 * application codes; provider messages and stack traces never reach the client.
 */
export async function handleAnalyze(request: Request, deps: AnalyzeDeps): Promise<Response> {
  const raw = await readLimitedBody(request);
  if (raw === null) return errorResponse("request_too_large");

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return errorResponse("invalid_request");
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return errorResponse("invalid_request");

  const sourceText = normalizeInput(parsed.data.text);
  if (sourceText.length === 0) return errorResponse("empty_input");
  if (sourceText.length > MAX_INPUT_CHARS) return errorResponse("too_long");
  if (isUrlOnly(sourceText)) return errorResponse("url_only");

  if (!deps.config.enabled) return errorResponse("live_unavailable");

  const budget = checkLiveBudget(deps.limiter, clientKey(request, deps.config), deps.config, deps.now?.());
  if (!budget.allowed) return errorResponse("rate_limited", { "Retry-After": String(budget.retryAfterSeconds) });

  const userTitle = parsed.data.title?.trim() || null;
  const sentences = segmentSource(sourceText);

  // Cancel provider work when the browser disconnects or the time budget runs out.
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort("timeout"), deps.config.timeoutMs);
  const signal = AbortSignal.any([request.signal, timeout.signal]);
  try {
    const result = await runAnalysis(deps.createProvider(deps.config), { sourceText, sentences, userTitle }, signal);
    if (!result.ok) return errorResponse(result.code);
    return Response.json({ ok: true, analysis: result.analysis }, { status: 200, headers: NO_STORE });
  } catch (error) {
    if (error instanceof ProviderError) {
      if (error.code === "timeout" || timeout.signal.aborted) return errorResponse("timeout");
      if (error.code === "cancelled") return errorResponse("cancelled");
      return errorResponse("provider_unavailable");
    }
    console.error("[analyze] unexpected failure", error instanceof Error ? error.name : "unknown");
    return errorResponse("provider_unavailable");
  } finally {
    clearTimeout(timer);
  }
}
