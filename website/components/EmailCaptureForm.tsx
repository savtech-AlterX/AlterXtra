"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function EmailCaptureForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Something went wrong.");
      setStatus("success");
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "email_signup");
      }
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return <p className="text-success">You&apos;re on the list — we&apos;ll email you the moment Alter-Xtra launches.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
      <label htmlFor="email" className="sr-only">
        Email address
      </label>
      <input
        id="email"
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 rounded-lg bg-transparent border border-border-dim px-4 py-3 text-foreground placeholder:text-text-muted focus:outline-none focus:border-glow"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-lg border border-glow px-5 py-3 font-medium text-glow-strong glow-text hover:bg-glow/10 transition-colors disabled:opacity-50"
      >
        {status === "submitting" ? "Joining…" : "Notify me"}
      </button>
      {status === "error" && error && <p className="text-danger text-sm sm:absolute sm:mt-14">{error}</p>}
    </form>
  );
}
