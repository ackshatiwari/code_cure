import type { CaseStudyView, FieldValue } from "@/lib/schemas/case";
import { getSource } from "@/content/sources";
import { cx } from "@/components/ui/styles";

const contextLabels: Record<string, string> = {
  humans: "People",
  animals: "Animals",
  cells: "Cells in a lab",
  mixed: "Mixed",
  not_reported: "Not reported",
  not_applicable: "Not applicable (illustration)",
};

const designStatusLabels = { explicit: "stated in the text", inferred: "inferred", not_reported: "not reported" } as const;

function FieldStatus({ value }: { value: FieldValue }) {
  if (value.status === "reported") return <span>{value.value}</span>;
  return (
    <span className={cx(value.status === "not_reported" ? "text-caution" : "text-ink-muted")}>
      <span className="font-semibold">{value.status === "not_reported" ? "Not reported" : "Not applicable"}</span>
      {value.note && <span className="text-ink-muted">: {value.note}</span>}
    </span>
  );
}

/** Field-by-field reading of a case's material. Missing, inapplicable and zero stay distinct. */
export function StudyDetails({ view }: { view: CaseStudyView }) {
  if (view.kind === "source_summary") {
    return (
      <div className="space-y-4">
        <p className="text-meta font-semibold text-ink-muted">{view.sourceType}</p>
        <p>{view.explanation}</p>
        <ul className="space-y-3">
          {view.statements.map((s, i) => (
            <li key={i} className="bracket text-[0.9375rem]">
              {s.quoted ? <q>{s.text}</q> : s.text}
              <span className="mt-0.5 block text-meta text-ink-muted">{getSource(s.sourceId)?.title}</span>
            </li>
          ))}
        </ul>
        <FieldTable fields={view.fields} />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <dl className="grid gap-x-4 gap-y-2 text-[0.9375rem] sm:grid-cols-[minmax(9rem,auto)_1fr]">
        <dt className="font-semibold">Question</dt>
        <dd>{view.question}</dd>
        <dt className="font-semibold">Who or what was studied</dt>
        <dd>{contextLabels[view.context]}</dd>
        <dt className="font-semibold">Design</dt>
        <dd>
          {view.design.value} <span className="text-meta text-ink-muted">({designStatusLabels[view.design.status]})</span>
        </dd>
      </dl>
      <FieldTable fields={view.fields} />
    </div>
  );
}

function FieldTable({ fields }: { fields: Array<{ label: string; value: FieldValue }> }) {
  return (
    <dl className="divide-y divide-rule border-y border-rule text-[0.9375rem]">
      {fields.map((f) => (
        <div key={f.label} className="grid gap-1 py-2 sm:grid-cols-[minmax(9rem,auto)_1fr] sm:gap-4">
          <dt className="font-semibold">{f.label}</dt>
          <dd>
            <FieldStatus value={f.value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
