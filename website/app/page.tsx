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

const MASCOTS = [
  { image: "male-bald-01.png", alt: "Bald male mascot in a suit" },
  { image: "male-curly-01.png", alt: "Curly-haired male mascot in a suit" },
  { image: "female-straight-01.png", alt: "Female mascot with straight hair in business attire" },
  { image: "female-curly-01.png", alt: "Female mascot with long curly hair" },
];

const MASCOT_BASE =
  "https://raw.githubusercontent.com/savtech-AlterX/AlterXtra/claude/hello-46bydk/assets/mascot/";

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Image src="/wordmark.png" alt="AlterX" width={148} height={34} priority />
        <Link href="/privacy" className="text-[11px] uppercase tracking-[0.2em] text-white/45 transition hover:text-white">
          Privacy
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col px-5 pb-20 sm:px-8">
        <section className="relative flex flex-col items-center pt-8 text-center sm:pt-14">
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-16 h-64 w-[min(80vw,700px)] -translate-x-1/2 rounded-full bg-[#1747ff]/10 blur-[100px]" />
          <Image src="/icon.png" alt="" width={66} height={66} className="relative mb-7 rounded-[18px] shadow-[0_0_42px_rgba(36,87,255,0.18)]" />
          <p className="relative mb-4 font-display text-[10px] font-semibold uppercase tracking-[0.38em] text-[#6284ff]">
            ALTER X · IDENTITY REPROGRAMMING
          </p>
          <h1 className="relative max-w-3xl font-display text-5xl font-extrabold leading-[0.98] tracking-[-0.055em] sm:text-7xl md:text-8xl">
            Become who you&apos;re
            <span className="block text-[#5278ff]">building toward.</span>
          </h1>
          <p className="relative mt-6 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
            A private, on-device identity-transformation app — habits, journaling, belief work, and messages to your future self.
            No account. No server. No tracking.
          </p>
          <div className="relative mt-7">
            <EmailCaptureForm />
          </div>
        </section>

        <section aria-label="AlterX mascots" className="mt-20 sm:mt-28">
          <div className="mb-5 flex items-end justify-between border-b border-[#2457ff]/35 pb-4">
            <div>
              <p className="font-display text-[10px] uppercase tracking-[0.3em] text-[#6284ff]">THE ALTER X COLLECTION</p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">Identities. In progress.</h2>
            </div>
            <span className="hidden font-display text-[10px] uppercase tracking-[0.2em] text-white/35 sm:block">01 — 04</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {MASCOTS.map((mascot, index) => (
              <article key={mascot.image} className="mascot-panel group relative isolate aspect-[3/4] overflow-hidden bg-[#03050b]">
                <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(36,87,255,0.15),transparent_65%)]" />
                <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black via-black/45 to-transparent" />
                <img src={MASCOT_BASE + mascot.image} alt={mascot.alt} loading="lazy" className="absolute inset-0 h-full w-full object-contain object-bottom transition duration-500 group-hover:scale-[1.035]" />
                <span className="mascot-ribbon absolute -left-[22%] top-[38%] z-10 w-[145%] -rotate-[18deg] border-y border-[#5b7dff]/90 bg-[#071344]/95 py-2 text-center font-display text-[9px] font-semibold uppercase tracking-[0.18em] text-white sm:py-3 sm:text-[10px] sm:tracking-[0.24em]">
                  Mascot coming soon
                </span>
                <span className="absolute bottom-3 left-3 font-display text-[9px] tracking-[0.24em] text-white/40">0{index + 1}</span>
                <span aria-hidden="true" className="absolute inset-0 border border-white/[0.08] transition group-hover:border-[#4770ff]/60" />
              </article>
            ))}
          </div>
        </section>

        <section aria-label="App Store announcement" className="launch-stage mt-16 sm:mt-20">
          <div className="relative isolate mx-auto max-w-4xl overflow-hidden px-5 py-10 text-center sm:px-12 sm:py-16">
            <div aria-hidden="true" className="absolute inset-0 -z-20 rounded-[48%_52%_44%_56%/18%_20%_16%_22%] border border-[#6284ff]/50 bg-[#060b20] shadow-[0_0_70px_rgba(36,87,255,0.12)]" />
            <div aria-hidden="true" className="absolute inset-[2%] -z-10 rounded-[48%_52%_44%_56%/18%_20%_16%_22%] opacity-90" style={{ background: "repeating-linear-gradient(112deg, transparent 0%, rgba(75,111,255,.08) 7%, rgba(255,255,255,.08) 10%, transparent 15%, rgba(20,45,140,.24) 21%, transparent 28%), linear-gradient(175deg, #101b4b 0%, #050817 32%, #111c48 52%, #03050d 77%, #14245c 100%)" }} />
            <div aria-hidden="true" className="absolute inset-x-[8%] top-0 -z-10 h-px bg-gradient-to-r from-transparent via-[#8aa2ff] to-transparent" />
            <p className="font-display text-[10px] uppercase tracking-[0.38em] text-[#8ca5ff]">ALTER X</p>
            <h2 className="mt-5 font-[cursive] text-4xl italic leading-tight text-white drop-shadow-[0_0_18px_rgba(99,132,255,0.45)] sm:text-6xl">
              Alter X coming to AppStore soon
            </h2>
            <div aria-hidden="true" className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-[#6284ff] to-transparent" />
          </div>
        </section>

        <section className="mt-20 grid gap-4 sm:mt-24 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <article key={feature.title} className="relative min-h-40 border border-white/[0.1] bg-white/[0.015] p-6 transition hover:border-[#2457ff]/50">
              <span className="font-display text-[10px] tracking-[0.22em] text-[#6284ff]">0{index + 1}</span>
              <h3 className="mt-5 font-display text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{feature.body}</p>
            </article>
          ))}
        </section>

        <div className="mt-20">
          <ReviewsSection />
        </div>
      </main>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs leading-6 text-white/35 sm:px-8">
        <p className="mb-2 font-semibold tracking-[0.12em] text-white/60">AlterX <span className="text-[#6284ff]">by Tech Sav</span></p>
        <p>AlterX is a self-guided personal development tool, not a substitute for professional mental health support.</p>
        <p className="mt-2">
          <Link href="/privacy" className="underline underline-offset-4 transition hover:text-white/70">Website privacy notice</Link>
        </p>
      </footer>
    </div>
  );
}
