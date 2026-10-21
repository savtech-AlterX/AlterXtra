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

      <aside aria-label="AlterX launch announcements" className="max-w-5xl w-full mx-auto px-6 pt-2">
        <div className="grid gap-3 sm:grid-cols-2">
          <section className="relative overflow-hidden border border-[#2457ff]/70 bg-[#05070c] px-5 py-5 sm:px-6">
            <p className="font-display text-[10px] uppercase tracking-[0.22em] text-[#7894ff]">ALTER X</p>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl leading-tight text-white">Coming to the App Store</h2>
            <p className="mt-2 font-display text-xs uppercase tracking-[0.12em] text-[#9ba8bc]">Currently in review</p>
            <span aria-hidden="true" className="absolute right-0 top-0 h-full w-px bg-[#2457ff] shadow-[0_0_18px_#2457ff]" />
          </section>
          <section className="relative overflow-hidden border border-[#2457ff]/35 bg-black px-5 py-5 sm:px-6">
            <p className="font-display text-[10px] uppercase tracking-[0.22em] text-[#7894ff]">ALTER-XTRA</p>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl leading-tight text-white">Premium unlock</h2>
            <p className="mt-2 font-display text-xs uppercase tracking-[0.12em] text-[#9ba8bc]">Coming soon</p>
            <span aria-hidden="true" className="absolute right-0 top-0 h-full w-px bg-[#2457ff]/50" />
          </section>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { name: "The Gentleman", image: "male-bald-01.png" },
            { name: "The Charmer", image: "male-curly-01.png" },
            { name: "The Executive", image: "female-straight-01.png" },
            { name: "The Muse", image: "female-curly-01.png" },
          ].map((mascot) => (
            <article key={mascot.image} className="relative flex min-h-48 flex-col items-center justify-end overflow-hidden border border-[#2457ff]/40 bg-[#05070c] px-2 pb-4 pt-3 text-center">
              <img
                src={`https://raw.githubusercontent.com/savtech-AlterX/AlterXtra/claude/hello-46bydk/assets/mascot/${mascot.image}`}
                alt={mascot.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-contain object-center opacity-90"
              />
              <div className="relative z-10 mt-28 w-full bg-black/90 px-2 py-2">
                <p className="font-display text-xs uppercase tracking-[0.12em] text-white">{mascot.name}</p>
                <p className="mt-1 font-display text-[10px] uppercase tracking-[0.14em] text-[#7894ff]">Mascot coming soon</p>
              </div>
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-[#2457ff]/70" />
            </article>
          ))}
        </div>
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
