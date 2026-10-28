import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { getCase } from "@/content/cases";
import { buildSampleAnalysis, getDecoderSample } from "@/content/samples";
import { initialProgress, investigationReducer, type InvestigationAction } from "@/lib/investigation";
import { DecoderOutput } from "@/components/decoder/DecoderOutput";
import { EvidenceBoard } from "@/components/investigation/EvidenceBoard";
import { RiskInContext } from "@/components/visualizations/RiskInContext";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const c1 = getCase("missing-denominator")!;

describe("RiskInContext", () => {
  it("changes the framing but never the underlying counts", async () => {
    const user = userEvent.setup();
    render(<RiskInContext example={c1.riskExample!} />);
    const caption = screen.getByText(/The underlying counts never change/);
    expect(caption).toHaveTextContent("20 of 1,000");
    expect(caption).toHaveTextContent("15 of 1,000");
    expect(screen.getByText(/0.5 percentage points/, { selector: "strong" })).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Relative change" }));
    expect(screen.getByText("25% lower")).toBeInTheDocument();
    expect(caption).toHaveTextContent("20 of 1,000");
    expect(caption).toHaveTextContent("25% relative reduction and a 0.5 percentage-point absolute difference");
  });

  it("offers an accessible text alternative for each frequency grid", () => {
    render(<RiskInContext example={c1.riskExample!} />);
    expect(screen.getByRole("img", { name: /20 of 1000 people in the comparison group/ })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /15 of 1000 people .*5 fewer than the comparison group/ })).toBeInTheDocument();
  });
});

function BoardHarness() {
  const opened = c1.clues.reduce((p, cl) => investigationReducer(c1, p, { type: "open_clue", clueId: cl.id }), initialProgress(c1));
  const [progress, setProgress] = useState(opened);
  const [selected, setSelected] = useState<string | null>(null);
  const act = (a: InvestigationAction) => setProgress((p) => investigationReducer(c1, p, a));
  return (
    <section>
      <h2>Evidence board</h2>
      <EvidenceBoard
        caseData={c1}
        progress={progress}
        selectedClueId={selected}
        onSelect={setSelected}
        onAssign={(clueId, relation) => {
          act({ type: "assign", clueId, relation });
          setSelected(null);
        }}
        onUnassign={(clueId) => act({ type: "unassign", clueId })}
        locked={false}
      />
    </section>
  );
}

describe("EvidenceBoard", () => {
  it("selects a clue, assigns a relation, groups it, and allows removal", async () => {
    const user = userEvent.setup();
    render(<BoardHarness />);
    const clue = c1.clues[1];
    await user.click(screen.getByRole("button", { name: clue.title }));
    await user.click(screen.getByRole("button", { name: "Challenges the claim" }));

    const group = screen.getByRole("region", { name: "Challenges the claim" });
    expect(within(group).getByRole("button", { name: `${clue.title}. Change relation` })).toBeInTheDocument();
    expect(screen.getByText("1 of 3 clues placed")).toBeInTheDocument();

    await user.click(within(group).getByRole("button", { name: `Remove ${clue.title} from the board` }));
    expect(within(group).getByText("No clues here yet.")).toBeInTheDocument();
    expect(screen.getByText("0 of 3 clues placed")).toBeInTheDocument();
  });

  it("supports keyboard activation", async () => {
    const user = userEvent.setup();
    render(<BoardHarness />);
    screen.getByRole("button", { name: c1.clues[0].title }).focus();
    await user.keyboard("{Enter}");
    screen.getByRole("button", { name: "Supports part of the claim" }).focus();
    await user.keyboard(" ");
    expect(within(screen.getByRole("region", { name: "Supports part of the claim" })).getByText(c1.clues[0].title)).toBeInTheDocument();
  });
});

describe("DecoderOutput", () => {
  const analysis = buildSampleAnalysis(getDecoderSample("fictional-rct-relative-risk")!);

  it("shows provenance and coverage labels", () => {
    render(<DecoderOutput analysis={analysis} stale={false} />);
    expect(screen.getAllByText("Prewritten teaching example").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Fictional teaching example — not a real study").length).toBeGreaterThan(0);
    expect(screen.getByText("Based on the pasted abstract")).toBeInTheDocument();
  });

  it("anchors highlight the actual input sentence and return focus", async () => {
    const user = userEvent.setup();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    render(<DecoderOutput analysis={analysis} stale={false} />);
    const anchor = screen.getAllByRole("button", { name: "Show source sentence S5 in the original text" })[0];
    await user.click(anchor);
    const highlighted = document.querySelector(".sentence-highlight");
    expect(highlighted).toHaveTextContent(analysis.sourceSentences.find((s) => s.id === "S5")!.text);
    await new Promise((r) => requestAnimationFrame(r));
    await user.click(screen.getByRole("button", { name: "Back to the explanation" }));
    expect(anchor).toHaveFocus();
  });

  it("keeps not-reported values distinct from zero", () => {
    render(<DecoderOutput analysis={analysis} stale={false} />);
    expect(screen.getAllByText("Not reported in the pasted abstract").length).toBeGreaterThan(0);
    expect(screen.queryByText(/^0$/)).not.toBeInTheDocument();
  });

  it("warns when the input changed after analysis", () => {
    render(<DecoderOutput analysis={analysis} stale />);
    expect(screen.getByRole("status")).toHaveTextContent("edited the text since this explanation was made");
  });
});
