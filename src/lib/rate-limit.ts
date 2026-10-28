/**
 * Rate limiting behind a small interface so the route can be tested with an injected
 * limiter and a deployment can swap in a shared store.
 *
 * `MemoryRateLimiter` is a fixed-window counter in one process's memory. It is suitable
 * for local development or a single private instance. It is NOT a distributed limit:
 * each server instance or restart has its own counts.
 */

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}

export interface RateLimiter {
  consume(key: string, limit: number, windowMs: number, now?: number): RateLimitDecision;
}

export class MemoryRateLimiter implements RateLimiter {
  private windows = new Map<string, { start: number; count: number }>();

  consume(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitDecision {
    const current = this.windows.get(key);
    if (!current || now - current.start >= windowMs) {
      this.windows.set(key, { start: now, count: 1 });
      this.prune(now, windowMs);
      return { allowed: true, retryAfterSeconds: 0 };
    }
    if (current.count >= limit) {
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((current.start + windowMs - now) / 1000)) };
    }
    current.count++;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  private prune(now: number, windowMs: number) {
    if (this.windows.size < 5000) return;
    for (const [k, v] of this.windows) if (now - v.start >= windowMs) this.windows.delete(k);
  }
}

/**
 * Checks the per-client bucket first, then the deployment-wide budget. A request
 * rejected by the client limit does not spend deployment budget.
 */
export function checkLiveBudget(
  limiter: RateLimiter,
  clientKey: string,
  opts: { perClientLimit: number; deploymentLimit: number; windowMs: number },
  now?: number,
): RateLimitDecision {
  const client = limiter.consume(`client:${clientKey}`, opts.perClientLimit, opts.windowMs, now);
  if (!client.allowed) return client;
  return limiter.consume("deployment", opts.deploymentLimit, opts.windowMs, now);
}
