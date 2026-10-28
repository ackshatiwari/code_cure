import "server-only";

/**
 * Server-side configuration for optional live analysis. Values are read per request
 * so a deployment can change them without a rebuild. Nothing here is exposed to the
 * browser except the boolean availability and a non-secret reason code.
 */

export type LiveUnavailableReason = "disabled" | "missing_key" | "unsafe_public_limiter";

export interface LiveConfig {
  enabled: boolean;
  reason: LiveUnavailableReason | null;
  apiKey: string | null;
  model: string;
  effort: "low" | "medium" | "high";
  timeoutMs: number;
  perClientLimit: number;
  deploymentLimit: number;
  windowMs: number;
  /** Header set by the hosting platform that identifies the client. Never a raw X-Forwarded-For. */
  trustedClientHeader: string | null;
}

function int(value: string | undefined, fallback: number, min: number, max: number) {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

export const DEFAULT_MODEL = "claude-opus-5-5";

export function getLiveConfig(env: NodeJS.ProcessEnv = process.env): LiveConfig {
  const apiKey = env.ANTHROPIC_API_KEY?.trim() || null;
  const wantsLive = env.ENABLE_LIVE_ANALYSIS === "true";
  const isProduction = env.NODE_ENV === "production";
  // The in-memory limiter only protects a single process. A public paid endpoint
  // needs hosting-level enforcement, or an explicit operator acknowledgement that
  // the deployment is private.
  const limiterOk =
    !isProduction || env.RATE_LIMIT_BACKEND === "hosting" || env.LIVE_ANALYSIS_ALLOW_IN_MEMORY_LIMITER === "true";

  let reason: LiveUnavailableReason | null = null;
  if (!wantsLive) reason = "disabled";
  else if (!apiKey) reason = "missing_key";
  else if (!limiterOk) reason = "unsafe_public_limiter";

  const effort = env.ANTHROPIC_EFFORT === "low" || env.ANTHROPIC_EFFORT === "high" ? env.ANTHROPIC_EFFORT : "medium";
  const trusted = env.TRUSTED_CLIENT_ID_HEADER?.trim().toLowerCase() || null;

  return {
    enabled: reason === null,
    reason,
    apiKey,
    model: env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL,
    effort,
    timeoutMs: int(env.LIVE_ANALYSIS_TIMEOUT_SECONDS, 90, 10, 300) * 1000,
    perClientLimit: int(env.LIVE_RATE_LIMIT_PER_CLIENT, 5, 1, 1000),
    deploymentLimit: int(env.LIVE_RATE_LIMIT_DEPLOYMENT, 100, 1, 100000),
    windowMs: int(env.LIVE_RATE_LIMIT_WINDOW_SECONDS, 600, 10, 86400) * 1000,
    trustedClientHeader: trusted && trusted !== "x-forwarded-for" ? trusted : null,
  };
}
