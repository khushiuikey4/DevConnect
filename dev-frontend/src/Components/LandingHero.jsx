/**
 * DevConnect — Landing Hero
 * Hero section styled like a code file, plus the infinite
 * scrolling tag marquee strip beneath it.
 *
 * Usage:
 *   import LandingHero from "./LandingHero";
 *   <LandingHero onStartWriting={...} onBrowsePosts={...} />
 *
 * Note: the marquee animation (tickerScroll) needs to be defined
 * once, globally — see the <style> block at the bottom of this
 * file, or move it into your global CSS / tailwind.config.js.
 */

const TAGS = [
  "react",
  "nodejs",
  "mongodb",
  "typescript",
  "docker",
  "nextjs",
  "postgres",
  "redux",
  "webrtc",
  "graphql",
];

// How many times the tag list repeats inside ONE group. Each group must be
// wider than the screen, otherwise a gap shows on the right while it scrolls.
// 4 repeats covers very wide monitors; raise it if you still see a gap.
const REPEATS = 4;

function MarqueeGroup({ hidden = false }) {
  return (
    <div className="flex shrink-0" aria-hidden={hidden}>
      {Array.from({ length: REPEATS }).flatMap((_, r) =>
        TAGS.map((tag) => (
          <span
            key={`${r}-${tag}`}
            className="font-mono text-[0.78rem] text-[#5a5c6b] mr-7"
          >
            <span className="text-[#8fd19e]">#</span>
            {tag}
          </span>
        ))
      )}
    </div>
  );
}

// internal helper component — not exported, only used inside LandingHero below
function TagMarquee() {
  return (
    <div className="border-t border-b border-[#383a46] bg-[#1e1f26] overflow-hidden py-3.5 whitespace-nowrap">
      {/* two identical groups side by side; sliding by -50% lands exactly
          on the start of the second group, so the loop has no jump and
          no empty space */}
      <div className="flex w-max animate-[tickerScroll_120s_linear_infinite] motion-reduce:animate-none">
        <MarqueeGroup />
        <MarqueeGroup hidden />
      </div>
    </div>
  );
}

// the only export in this file — the actual component you import elsewhere
export default function LandingHero({ onStartWriting, onBrowsePosts }) {
  return (
    <section id="readme" className="scroll-mt-32 bg-[#1e1f26] text-[#e8e9ee]">
      <div className="max-w-[1080px] mx-auto px-7 pt-20 pb-16">
        <div className="font-mono text-[0.85rem] text-[#5a5c6b] mb-2.5">
          <span className="text-[#b39ddb]">const</span>{" "}
          <span className="text-[#7eb6e0]">writer</span> ={" "}
          <span className="text-[#b39ddb]">you</span>;
        </div>

        <h1 className="text-[2.3rem] sm:text-[3rem] lg:text-[3.6rem] leading-[1.12] font-medium tracking-[-0.015em] max-w-[760px] mb-6">
          <span className="text-[#5a5c6b] font-normal font-mono">#</span> Write
          it down
          <br />
          before it disappears.
          <span
            aria-hidden="true"
            className="inline-block w-[3px] h-[0.9em] bg-[#8fd19e] align-middle ml-1 animate-[blink_1s_step-end_infinite] motion-reduce:animate-none"
          />
        </h1>

        <blockquote className="border-l-[3px] border-[#383a46] pl-4.5 text-[#8b8d9b] text-[1.02rem] leading-[1.65] max-w-[540px] mb-9">
          DevConnect is where developers turn side projects, debugging wars,
          and half-finished ideas into something worth reading — tagged by
          stack, found by the right people.
        </blockquote>

        <div className="flex gap-3.5 flex-wrap">
          <button
            onClick={onStartWriting}
            className="px-6 py-3 rounded-md font-mono text-[0.85rem] font-semibold bg-[#8fd19e] text-[#182019] hover:opacity-90 transition-opacity"
          >
            start writing
          </button>
          <button
            onClick={onBrowsePosts}
            className="px-6 py-3 rounded-md font-mono text-[0.85rem] border border-[#383a46] text-[#8b8d9b] hover:text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors"
          >
            browse posts
          </button>
        </div>
      </div>

      <TagMarquee />

      {/* keyframes used above — move these into your global stylesheet
          (e.g. index.css) instead of inlining, this is here just so
          the component works standalone */}
      <style>{`
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </section>
  );
}
