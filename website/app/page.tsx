"use client";

import Image from "next/image";
import Link from "next/link";
import { EmailCaptureForm } from "@/components/EmailCaptureForm";

const FEATURES = [
  {
    number: "01",
    title: "Identity",
    body: "Choose the person you are working to become, then build consistency through deliberate action.",
  },
  {
    number: "02",
    title: "Habits",
    body: "Recognise unhelpful patterns and replace them with routines that support your chosen identity.",
  },
  {
    number: "03",
    title: "Belief work",
    body: "Examine limiting beliefs and record the perspectives you want to practise instead.",
  },
  {
    number: "04",
    title: "Goals",
    body: "Turn ambitions into clear steps, with target dates and visible progress.",
  },
  {
    number: "05",
    title: "Journal",
    body: "Keep a private record of your decisions, reflections and progress over time.",
  },
  {
    number: "06",
    title: "Future self",
    body: "Create letters or video messages for a future date or personal milestone.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between border-b border-white/10 px-5 py-5 sm:px-8">
        <Link href="/" aria-label="AlterX home" className="shrink-0">
          <Image src="/wordmark.png" alt="AlterX" width={142} height={32} priority />
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-5 text-[10px] uppercase tracking-[0.16em] text-white/55 sm:gap-8 sm:text-xs">
          <a href="#approach" className="transition hover:text-white">Approach</a>
          <a href="#features" className="transition hover:text-white">Features</a>
          <a href="#xtra" className="transition hover:text-white">Alter-Xtra</a>
          <Link href="/privacy" className="transition hover:text-white">Privacy</Link>
        </nav>
      </header>

      <main>
        <section className="relative mx-auto flex min-h-[570px] w-full max-w-6xl flex-col items-start justify-center px-5 py-24 sm:min-h-[650px] sm:px-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/2 h-[430px] w-[430px] -translate-y-1/2 rounded-full bg-[#1747ff]/10 blur-[120px]" />
          <div className="relative max-w-4xl">
            <p className="mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7894ff] sm:text-xs">
              <span className="h-px w-8 bg-[#5278ff]" />
              Identity. Intention. Action.
            </p>
            <h1 className="font-display max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-7xl md:text-8xl">
              Change the way
              <span className="block text-[#6284ff]">you become.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
              AlterX is a self-guided identity and personal development app designed to help you align your habits, beliefs and goals with the person you want to become.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a href="#features" className="inline-flex min-h-12 items-center justify-center border border-[#5278ff] bg-[#1747ff]/10 px-6 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#1747ff]/20">
                Explore AlterX <span aria-hidden="true" className="ml-4 text-[#7894ff]">↘</span>
              </a>
              <p className="text-xs leading-5 text-white/40">iOS release pending App Store review</p>
            </div>
          </div>
          <div className="relative mt-20 grid w-full grid-cols-3 border-y border-white/10 py-5 sm:mt-24 sm:py-7">
            <div className="pr-3 sm:pr-6">
              <p className="text-[9px] uppercase tracking-[0.16em] text-white/35 sm:text-[10px]">01 / Focus</p>
              <p className="mt-2 text-xs font-medium text-white/80 sm:text-sm">Identity first</p>
            </div>
            <div className="border-x border-white/10 px-3 sm:px-6">
              <p className="text-[9px] uppercase tracking-[0.16em] text-white/35 sm:text-[10px]">02 / Method</p>
              <p className="mt-2 text-xs font-medium text-white/80 sm:text-sm">Daily practice</p>
            </div>
            <div className="pl-3 sm:pl-6">
              <p className="text-[9px] uppercase tracking-[0.16em] text-white/35 sm:text-[10px]">03 / Outcome</p>
              <p className="mt-2 text-xs font-medium text-white/80 sm:text-sm">Lasting change</p>
            </div>
          </div>
        </section>

        <section id="approach" className="border-y border-white/10 bg-[#05060a]">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:grid-cols-[0.8fr_1.2fr] sm:gap-16 sm:px-8 sm:py-24">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7894ff]">The approach</p>
              <h2 className="mt-4 max-w-sm text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">Progress begins with who you practise being.</h2>
            </div>
            <div className="max-w-2xl">
              <p className="text-sm leading-7 text-white/60 sm:text-base sm:leading-8">
                AlterX brings identity-based reflection and practical goal-setting into one focused space. Define the direction you want to take, make the work measurable, and review the choices that move you forward.
              </p>
              <p className="mt-5 text-sm leading-7 text-white/60 sm:text-base sm:leading-8">
                The purpose is not to spend more time in an app. It is to make more intentional decisions outside it.
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="mb-10 max-w-2xl sm:mb-14">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7894ff]">Core capabilities</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">A practical system for personal change.</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/50 sm:text-base sm:leading-7">
              Six connected tools. One clear purpose: help turn intention into consistent action.
            </p>
          </div>
          <div className="grid border-l border-t border-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <article key={feature.number} className="min-h-48 border-b border-r border-white/10 p-6 sm:min-h-52 sm:p-8">
                <p className="text-[10px] tracking-[0.2em] text-[#7894ff]">{feature.number}</p>
                <h3 className="mt-7 text-lg font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/50">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="xtra" className="border-y border-[#2457ff]/35 bg-[#04060c]">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:grid-cols-[1fr_1fr] sm:items-center sm:px-8 sm:py-20">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7894ff]">The premium edition</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">Alter<span className="text-[#6284ff]">-Xtra.</span></h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/55 sm:text-base">
                An expanded toolkit for people who want more room to build, track and refine their identities.
              </p>
            </div>
            <div className="border-l-2 border-[#5278ff] pl-6 sm:pl-8">
              <ul className="space-y-4 text-sm leading-6 text-white/70">
                <li><span className="mr-3 text-[#7894ff]">—</span>Multiple identity accounts</li>
                <li><span className="mr-3 text-[#7894ff]">—</span>Unlimited habits and belief systems</li>
                <li><span className="mr-3 text-[#7894ff]">—</span>Identity feedback, statistics and reports</li>
              </ul>
              <p className="mt-7 text-[10px] uppercase tracking-[0.2em] text-white/35">Premium details will be announced at launch.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="grid gap-10 sm:grid-cols-[0.9fr_1.1fr] sm:items-start">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7894ff]">Launch updates</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Be notified when AlterX is available.</h2>
            </div>
            <div>
              <p className="mb-5 max-w-xl text-sm leading-6 text-white/55">
                Leave your email to receive an availability announcement and occasional product updates.
              </p>
              <EmailCaptureForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold tracking-[0.1em] text-white/65">AlterX <span className="font-normal text-[#7894ff]">by Tech Sav</span></p>
          <p className="max-w-xl leading-5">AlterX is a self-guided personal development tool and is not a substitute for professional mental health support.</p>
          <Link href="/privacy" className="underline underline-offset-4 transition hover:text-white">Website privacy notice</Link>
        </div>
      </footer>
    </div>
  );
}
