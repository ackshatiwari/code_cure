import { connection } from "next/server";
import { getLiveConfig } from "@/lib/analysis/config";

/** Public capability check. Exposes availability only, never the model, key or limits. */
export async function GET() {
  await connection();
  const config = getLiveConfig();
  return Response.json(
    { liveAnalysis: config.enabled, reason: config.reason },
    { headers: { "Cache-Control": "no-store" } },
  );
}
