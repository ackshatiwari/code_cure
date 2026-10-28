/** Application error codes returned by POST /api/analyze. Safe to import in the browser. */
export type AnalyzeErrorCode =
  | "invalid_request"
  | "empty_input"
  | "too_long"
  | "request_too_large"
  | "url_only"
  | "live_unavailable"
  | "rate_limited"
  | "timeout"
  | "cancelled"
  | "provider_unavailable"
  | "provider_declined"
  | "invalid_response";

export const MAX_INPUT_CHARS = 15_000;
export const MAX_REQUEST_BYTES = 60 * 1024;
export const MAX_TITLE_CHARS = 300;

export const analyzeErrorMessages: Record<AnalyzeErrorCode, string> = {
  invalid_request: "The request couldn't be read. Please try again.",
  empty_input: "Paste some abstract text first.",
  too_long: `That's more than ${MAX_INPUT_CHARS.toLocaleString("en-US")} characters. Paste just the abstract, not the whole paper.`,
  request_too_large: "That request is too large. Paste just the abstract text.",
  url_only:
    "That looks like a link or DOI. Paper2People doesn't fetch pages. Paste the abstract text itself instead.",
  live_unavailable:
    "Analysis of your own abstract isn't enabled in this installation. You can explore a supplied example.",
  rate_limited: "You've reached the limit for live analyses for now. Please wait and try again.",
  timeout: "The analysis took too long and was stopped. Your text is still here; you can try again.",
  cancelled: "Analysis cancelled. Your text is still here.",
  provider_unavailable: "The analysis service couldn't be reached. Your text is still here; you can try again.",
  provider_declined:
    "The analysis service declined to analyze this text. Your text is still here. You can edit it or explore a supplied example.",
  invalid_response:
    "The analysis came back in a form that couldn't be checked against your text, so it isn't shown. You can try again.",
};

export const analyzeErrorStatus: Record<AnalyzeErrorCode, number> = {
  invalid_request: 400,
  empty_input: 400,
  too_long: 413,
  request_too_large: 413,
  url_only: 422,
  live_unavailable: 503,
  rate_limited: 429,
  timeout: 504,
  cancelled: 499,
  provider_unavailable: 502,
  provider_declined: 422,
  invalid_response: 502,
};

/** A lone link, DOI or DOI-like identifier with no abstract text around it. */
export function isUrlOnly(text: string): boolean {
  return /^\s*(?:<)?(?:https?:\/\/\S+|www\.\S+|doi:\s*\S+|10\.\d{4,9}\/\S+)(?:>)?\s*$/i.test(text);
}
