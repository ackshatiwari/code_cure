import type { AnswerOption, VerdictId } from "@/lib/schemas/case";

export const verdictDefinitions: Record<VerdictId, { label: string; definition: string }> = {
  supported: {
    label: "Supported",
    definition: "Relevant evidence supports the claim at the scope stated.",
  },
  misleading: {
    label: "Misleading",
    definition: "A true or plausible element is framed in a way that materially changes its meaning.",
  },
  unsupported: {
    label: "Unsupported",
    definition:
      "The supplied evidence does not justify the asserted conclusion. This does not prove the opposite.",
  },
  "not-enough-information": {
    label: "Not enough information",
    definition: "Key details needed to evaluate the claim are absent from the supplied material.",
  },
};

export const verdictOrder: VerdictId[] = ["supported", "misleading", "unsupported", "not-enough-information"];

/** Builds the four fixed verdict options with case-specific explanations. */
export function verdictOptions(explanations: Record<VerdictId, string>): (AnswerOption & { id: VerdictId })[] {
  return verdictOrder.map((id) => ({
    id,
    label: verdictDefinitions[id].label,
    explanation: explanations[id],
  }));
}
