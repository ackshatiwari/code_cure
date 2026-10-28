"use client";

import { ClipboardCheck, Copy } from "lucide-react";
import { useId, useRef, useState } from "react";
import { cases } from "@/content/cases";
import { announce } from "@/components/ui/Announcer";
import { buttonClass } from "@/components/ui/styles";

/**
 * There is no reporting backend, so this builds issue details to copy into whatever
 * channel the deployment's maintainers use. Nothing is sent from here.
 */
export function IssueReport() {
  const uid = useId();
  const [where, setWhere] = useState("general");
  const [details, setDetails] = useState("");
  const [state, setState] = useState<"idle" | "copied" | "fallback" | "empty">("idle");
  const fallbackRef = useRef<HTMLTextAreaElement>(null);

  const location =
    where === "general" ? "General / other" : where === "decoder" ? "Decoder samples" : where === "glossary" ? "Glossary" : cases.find((c) => c.slug === where)?.title;
  const report = `Paper2People content issue\nWhere: ${location}\nCase version: ${cases.find((c) => c.slug === where)?.version ?? "n/a"}\n\nWhat seems wrong, and why:\n${details.trim()}`;

  const copy = async () => {
    if (!details.trim()) {
      setState("empty");
      return;
    }
    try {
      await navigator.clipboard.writeText(report);
      setState("copied");
      announce("Issue details copied.");
    } catch {
      setState("fallback");
      requestAnimationFrame(() => fallbackRef.current?.select());
    }
  };

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <label htmlFor={`${uid}-where`} className="font-semibold">
          Where is the issue?
        </label>
        <select
          id={`${uid}-where`}
          value={where}
          onChange={(e) => setWhere(e.target.value)}
          className="mt-2 block min-h-12 w-full rounded-[var(--radius-control)] border border-control bg-surface px-3"
        >
          <option value="general">General / other</option>
          {cases.map((c) => (
            <option key={c.slug} value={c.slug}>
              Case {c.number}: {c.title}
            </option>
          ))}
          <option value="decoder">Decoder samples</option>
          <option value="glossary">Glossary</option>
        </select>
      </div>
      <div>
        <label htmlFor={`${uid}-details`} className="font-semibold">
          What seems wrong, and why?
        </label>
        <p id={`${uid}-hint`} className="text-[0.9375rem] text-ink-muted">
          Please don&apos;t include personal health information.
        </p>
        <textarea
          id={`${uid}-details`}
          rows={5}
          value={details}
          onChange={(e) => {
            setDetails(e.target.value);
            if (state !== "idle") setState("idle");
          }}
          aria-describedby={`${uid}-hint${state === "empty" ? ` ${uid}-err` : ""}`}
          aria-invalid={state === "empty"}
          className="mt-2 block w-full rounded-[var(--radius-control)] border border-control bg-surface p-3"
        />
        {state === "empty" && (
          <p id={`${uid}-err`} className="mt-1 text-[0.9375rem] font-semibold text-critical">
            Describe the issue first.
          </p>
        )}
      </div>
      <button type="button" className={buttonClass("secondary", "sm")} onClick={copy}>
        {state === "copied" ? <ClipboardCheck size={16} strokeWidth={1.75} aria-hidden /> : <Copy size={16} strokeWidth={1.75} aria-hidden />}
        {state === "copied" ? "Copied" : "Copy issue details"}
      </button>
      {state === "copied" && (
        <p className="text-[0.9375rem] text-primary">Copied. Paste it into a message to whoever maintains this installation.</p>
      )}
      {state === "fallback" && (
        <div>
          <label htmlFor={`${uid}-fb`} className="text-[0.9375rem] font-semibold">
            Copying was blocked. Select this text and copy it yourself.
          </label>
          <textarea id={`${uid}-fb`} ref={fallbackRef} readOnly rows={7} value={report} className="mt-2 w-full rounded-[var(--radius-control)] border border-control bg-surface p-3 font-mono text-[0.8125rem]" />
        </div>
      )}
    </div>
  );
}
