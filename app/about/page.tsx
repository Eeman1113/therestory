import type { Metadata } from "next";
import { MicroCaps } from "@/components/common/micro-caps";
import { HairlineRule } from "@/components/common/hairline-rule";

export const metadata: Metadata = {
  title: "About",
  description:
    "The mission behind Therestory, the sourcing standards every page follows, and how the site's image credits work.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-12 sm:px-8 sm:py-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-8">
          <MicroCaps as="p">About</MicroCaps>
          <h1 className="mt-4 text-[36px] leading-[1.05] tracking-[-0.02em] sm:text-[52px]">
            An editorial history of the world, organised by time.
          </h1>
          <p className="mt-6 max-w-[62ch] text-base leading-7 text-ink-muted sm:text-lg sm:leading-8">
            Therestory is an attempt to build the most complete and up-to-date
            home for world history — but shaped like a timeline rather than an
            encyclopedia. Pick a moment. See what was happening in every corner
            of the world at exactly that instant.
          </p>
        </div>
      </div>

      <HairlineRule className="mt-12 sm:mt-16" />

      <section className="grid grid-cols-1 gap-x-16 gap-y-10 py-12 sm:gap-y-14 sm:py-16 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <MicroCaps as="p">§ 01</MicroCaps>
          <h2 className="mt-2 text-xl tracking-[-0.01em]">The mission</h2>
        </div>
        <div className="max-w-[65ch] text-base leading-[1.75] text-ink sm:text-[15px] sm:leading-[1.7] lg:col-span-9">
          <p>
            Most histories are organised by topic or by region. Therestory is
            organised by time. The homepage is a horizontal ruler that spans
            roughly 3500 BCE to today. Every marker is an event. Every event
            page tells you not only what happened, but what was happening
            <em> everywhere else on Earth at the same moment</em> — because a
            history that treats the world as a set of parallel stories always
            reads more truthfully than one that treats it as a single line
            through Europe.
          </p>
          <p className="mt-4">
            This is v0.1. The dataset is small on purpose. The architecture is
            designed to grow to hundreds and then thousands of anchor events
            without collapsing under its own weight.
          </p>
        </div>
      </section>

      <HairlineRule />

      <section className="grid grid-cols-1 gap-x-16 gap-y-10 py-12 sm:gap-y-14 sm:py-16 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <MicroCaps as="p">§ 02</MicroCaps>
          <h2 className="mt-2 text-xl tracking-[-0.01em]">Sourcing standard</h2>
        </div>
        <div className="max-w-[65ch] text-base leading-[1.75] text-ink sm:text-[15px] sm:leading-[1.7] lg:col-span-9">
          <p>
            Every fact, date, and name on this site must be verifiable in at
            least two reputable independent sources. In practice, that means an
            authoritative encyclopedia (typically English Wikipedia) is
            cross-checked against at least one of: World History Encyclopedia,
            Britannica, a museum catalogue, a university publication, or an
            official history office such as NASA.
          </p>
          <p className="mt-4">
            Where scholarship genuinely conflicts — for instance, whether the
            name &ldquo;Menes&rdquo; refers to Narmer or Hor-Aha — the page
            presents the mainstream view and marks the event as{" "}
            <em>disputed</em>. Nothing is invented. If it cannot be verified, it
            does not go on the page.
          </p>
          <p className="mt-4">
            Every event page ends with a numbered sources list. Click through
            and check anything.
          </p>
        </div>
      </section>

      <HairlineRule />

      <section className="grid grid-cols-1 gap-x-16 gap-y-10 py-12 sm:gap-y-14 sm:py-16 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <MicroCaps as="p">§ 03</MicroCaps>
          <h2 className="mt-2 text-xl tracking-[-0.01em]">Imagery & credits</h2>
        </div>
        <div className="max-w-[65ch] text-base leading-[1.75] text-ink sm:text-[15px] sm:leading-[1.7] lg:col-span-9">
          <p>
            All historical imagery on Therestory comes from Wikimedia Commons,
            and is either public domain or licensed under a Creative Commons
            licence. Every image stores its caption, credit line, licence, and
            the URL of the Commons file page — and displays them on the page.
          </p>
          <p className="mt-4">
            If you spot an image whose licence looks wrong, please open an issue
            on the repository and it will be pulled while the claim is checked.
          </p>
        </div>
      </section>

      <HairlineRule />

      <section className="grid grid-cols-1 gap-x-16 gap-y-10 py-12 sm:gap-y-14 sm:py-16 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <MicroCaps as="p">§ 04</MicroCaps>
          <h2 className="mt-2 text-xl tracking-[-0.01em]">Colophon</h2>
        </div>
        <div className="max-w-[65ch] text-base leading-[1.75] text-ink sm:text-[15px] sm:leading-[1.7] lg:col-span-9">
          <p>
            Set in <span className="font-mono">Geist Sans</span> and{" "}
            <span className="font-mono">Geist Mono</span> — the mono
            middle-dot dates (<span className="font-mono">1453·05·29</span>) are
            the site&rsquo;s signature typographic detail. The accent colour is an
            oxidised iron blue meant to evoke fountain pens on old maps. Icons
            are from Lucide. The site is a Next.js static export hosted on
            GitHub Pages.
          </p>
          <p className="mt-4">
            Corrections, additions, and licence complaints go to the repository
            on GitHub.
          </p>
        </div>
      </section>
    </div>
  );
}
