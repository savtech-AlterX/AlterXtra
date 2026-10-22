"use client";

import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
      <Image
        src="/wordmark.png"
        alt="AlterX"
        width={180}
        height={42}
        priority
        className="mb-12 h-auto w-40 sm:w-48"
      />
      <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#7894ff] sm:text-base">
        Coming to App Store soon
      </p>
    </main>
  );
}
