import { getLiveConfig } from "@/lib/analysis/config";
import { handleAnalyze } from "@/lib/analysis/handle-analyze";
import { createAnthropicProvider } from "@/lib/analysis/provider";
import { MemoryRateLimiter } from "@/lib/rate-limit";

// Single-process limiter. See docs/content-policy.md before exposing live mode publicly.
const limiter = new MemoryRateLimiter();

export async function POST(request: Request) {
  return handleAnalyze(request, { config: getLiveConfig(), limiter, createProvider: createAnthropicProvider });
}
