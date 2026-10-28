"use client";

import { useEffect, useState } from "react";

type Listener = (message: string) => void;
const listeners = new Set<Listener>();

/** Sends a brief polite announcement to assistive technology. */
export function announce(message: string) {
  for (const l of listeners) l(message);
}

/** One polite live region for the whole app, so announcements never stack up. */
export function Announcer() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const listener: Listener = (m) => {
      // Clear first so repeating the same message is still announced.
      setMessage("");
      clearTimeout(timer);
      timer = setTimeout(() => setMessage(m), 60);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      clearTimeout(timer);
    };
  }, []);
  return (
    <div aria-live="polite" aria-atomic="true" role="status" className="sr-only">
      {message}
    </div>
  );
}
