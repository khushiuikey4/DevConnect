/**
 * DevConnect — Landing Work (how-it-works section)
 * Three function-signature style cards explaining the core
 * features. Anchors to #how so the header's "how-it-works.js"
 * nav link scrolls here.
 *
 * Usage:
 *   import LandingWork from "./LandingWork";
 *   <LandingWork />
 */

const STEPS = [
  {
    fn: "write",
    param: "idea",
    description:
      "Post a write-up on what you built, what broke, or what you learned. Tag it by stack so it reaches people working on the same thing.",
  },
  {
    fn: "connect",
    param: "devs",
    description:
      "Comment threads built for technical discussion. Follow people whose stack overlaps with yours.",
  },
  {
    fn: "getFound",
    param: "post",
    description:
      "Every post is a permanent, searchable page — still useful to someone six months from now.",
  },
];

function FnCard({ fn, param, description }) {
  return (
    <div className="bg-[#23252e] border border-[#383a46] rounded-lg p-[26px_22px]">
      <div className="font-mono text-[0.8rem] mb-4">
        <span className="text-[#7eb6e0]">{fn}</span>
        <span className="text-[#e8e9ee]">(</span>
        <span className="text-[#b39ddb]">{param}</span>
        <span className="text-[#e8e9ee]">)</span>
      </div>
      <p className="text-[#8b8d9b] text-[0.87rem] leading-[1.6] m-0">
        {description}
      </p>
    </div>
  );
}

export default function LandingWork() {
  return (
    <section id="work" className="scroll-mt-32 bg-[#1e1f26] text-[#e8e9ee] py-20">
      <div className="max-w-[1080px] mx-auto px-7">
        <div className="max-w-[560px] mb-12">
          <div className="font-mono text-[0.78rem] text-[#8fd19e] mb-3.5">
            // how it works
          </div>
          <h2 className="text-[1.6rem] sm:text-[2.1rem] font-medium tracking-[-0.01em] mb-3.5">
            Three functions, no ceremony.
          </h2>
          <p className="text-[#8b8d9b] text-[0.95rem] leading-[1.6] m-0">
            No algorithm deciding who sees your work. No character limit
            cutting off the explanation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STEPS.map((step) => (
            <FnCard key={step.fn} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}
