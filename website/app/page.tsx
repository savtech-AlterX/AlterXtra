import Image from "next/image";
import Link from "next/link";
import { EmailCaptureForm } from "@/components/EmailCaptureForm";
import { ReviewsSection } from "@/components/ReviewsSection";

const FEATURES = [
  {
    title: "Pick an identity",
    body: "Choose the archetype of who you're becoming, and track every session you spend actually being them.",
  },
  {
    title: "Rewrite limiting beliefs",
    body: "Name the belief, trace where it came from, and write down what replaces it.",
  },
  {
    title: "Reprogram habits",
    body: "Swap an old trigger-response loop for a new one, then check in on whether it actually stuck.",
  },
  {
    title: "Journal & log book",
    body: "Daily journaling plus a log book for proof you stayed aligned — or a correction when you didn't.",
  },
  {
    title: "Message your future self",
    body: "Record a video or letter that unlocks on a date you choose, or once you've shown up enough times to earn it.",
  },
  {
    title: "Goals with real steps",
    body: "Break a goal into steps you can actually check off, with a target date keeping it honest.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      <header className="flex items-center justify-between px-6 py-6 max-w-5xl w-full mx-auto">
        <Image src="/wordmark.png" alt="AlterX" width={140} height={32} priority />
        <Link href="/privacy" className="text-sm text-text-muted hover:text-text-secondary">
          Privacy
        </Link>
      </header>

      <aside aria-label="AlterX announcements" className="grid gap-3 sm:grid-cols-2 max-w-5xl w-full mx-auto px-6 pt-2">
        <section className="relative overflow-hidden border border-[#2457ff]/70 bg-[#05070c] px-5 py-5 sm:px-6">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#6f91ff]">ALTER X · THE FIRST STEP</p>
          <p className="mt-3 font-display text-xl sm:text-2xl leading-tight text-white">You don’t have to feel ready.<br />You just have to begin.</p>
          <p className="mt-3 text-xs leading-relaxed text-text-secondary">The app is making its way through App Store review.</p>
          <span aria-hidden="true" className="absolute right-0 top-0 h-full w-px bg-[#2457ff]/70 shadow-[0_0_18px_#2457ff]" />
        </section>
        <section className="relative overflow-hidden border border-[#2457ff]/35 bg-black px-5 py-5 sm:px-6">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#6f91ff]">ALTER-XTRA · THE NEXT LEVEL</p>
          <p className="mt-3 font-display text-xl sm:text-2xl leading-tight text-white">Don’t just set the goal.<br />Become the person who gets there.</p>
          <p className="mt-3 text-xs leading-relaxed text-text-secondary">The premium unlock is on its way.</p>
          <span aria-hidden="true" className="absolute right-0 top-0 h-full w-px bg-[#2457ff]/40" />
        </section>
      </aside>

      <main className="flex flex-col gap-24 px-6 pb-24 max-w-5xl w-full mx-auto">
        <section className="flex flex-col items-center text-center gap-6 pt-12">
          <Image src="/icon.png" alt="" width={72} height={72} className="rounded-2xl" />
          <h1 className="font-display text-4xl sm:text-5xl text-glow-strong glow-text max-w-2xl">
            Become who you&apos;re building toward.
          </h1>
          <p className="text-text-secondary max-w-xl text-lg">
            AlterX is a private, on-device identity-transformation app — habits, journaling, belief work, and
            messages to your future self. No account, no server, no tracking.
          </p>
          <p className="text-xs tracking-widest text-glow uppercase">On your phone and on your laptop</p>
          <EmailCaptureForm />
        </section>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="glow-panel p-6 flex flex-col gap-2">
              <h3 className="font-display text-lg text-glow-strong">{f.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </section>

        <section className="glow-panel p-8 flex flex-col items-center text-center gap-3 max-w-md mx-auto">
          <span className="text-xs tracking-widest text-glow">ALTER-XTRA</span>
          <p className="font-display text-2xl text-foreground">
            $17.99 <span className="text-base text-text-secondary font-sans">one-time unlock</span>
          </p>
          <p className="text-text-secondary text-sm">
            Unlimited identities and habits, weekly reports, a full-year activity map, and more. Buy it once,
            keep it — no subscription.
          </p>
          <p className="text-text-muted text-xs">Coming soon — not on sale yet.</p>
        </section>

        <ReviewsSection />
      </main>

      <footer className="mt-auto border-t border-border-dim px-6 py-8 text-center text-text-muted text-sm">
        <p>AlterX is a self-guided personal development tool, not a substitute for professional mental health support.</p>
        <p className="mt-2">
          <Link href="/privacy" className="underline underline-offset-4">
            Website privacy notice
          </Link>
        </p>
      </footer>
    </div>
  );
}
