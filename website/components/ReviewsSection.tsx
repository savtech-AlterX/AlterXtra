type Review = {
  quote: string;
  author: string;
  source: "App Store" | "Google Play";
};

/**
 * Real reviews only — starts empty on purpose. Fabricated testimonials are
 * both an FTC Endorsement Guides violation and the single easiest thing here
 * to get sued over, so don't seed this with placeholder quotes. Add entries
 * here as real users leave them, ideally copy-pasted verbatim with their
 * permission or from a public store listing you can screenshot as proof.
 */
const REVIEWS: Review[] = [];

const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL;
const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL;

export function ReviewsSection() {
  return (
    <section className="flex flex-col gap-6 items-center text-center">
      <h2 className="font-display text-2xl text-glow-strong glow-text">What people are saying</h2>

      {REVIEWS.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-3 w-full">
          {REVIEWS.map((r) => (
            <blockquote key={r.author} className="glow-panel p-5 text-left flex flex-col gap-3">
              <p className="text-text-secondary text-sm leading-relaxed">&ldquo;{r.quote}&rdquo;</p>
              <footer className="text-xs text-text-muted">
                — {r.author}, {r.source}
              </footer>
            </blockquote>
          ))}
        </div>
      ) : (
        <p className="text-text-secondary max-w-md">
          AlterX is brand new — no reviews yet. Be the first to leave one once you&apos;ve tried it.
        </p>
      )}

      {(APP_STORE_URL || PLAY_STORE_URL) && (
        <div className="flex gap-4">
          {APP_STORE_URL && (
            <a href={APP_STORE_URL} className="text-glow underline underline-offset-4 text-sm">
              Rate on the App Store
            </a>
          )}
          {PLAY_STORE_URL && (
            <a href={PLAY_STORE_URL} className="text-glow underline underline-offset-4 text-sm">
              Rate on Google Play
            </a>
          )}
        </div>
      )}
    </section>
  );
}
