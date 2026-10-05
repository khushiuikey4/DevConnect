/**
 * DevConnect — Landing Footer
 * Closing CTA band + footer bar for the landing page.
 *
 * Usage:
 *   import LandingFooter from "./LandingFooter";
 *   <LandingFooter onStartWriting={...} />
 */

import LandingWork from "./LandingWork";
import { Link } from "react-router-dom";

export default function LandingFooter({ onStartWriting }) {
  return (
    <>
      <section id="write" className=" scroll-mt-32 bg-[#1e1f26] text-[#e8e9ee] text-center py-24 border-t border-[#383a46]">
        <div className="max-w-[1080px] mx-auto px-7">
          <div className="font-mono text-[0.78rem] text-[#8fd19e] mb-3.5">
            // no algorithm, no character limit
          </div>
          <h2 className="text-[1.6rem] sm:text-[2.1rem] font-medium tracking-[-0.01em] max-w-[560px] mx-auto mb-7">
            Your next project deserves more than a tweet.
          </h2>
          <Link to="/authenticationPage"
            onClick={onStartWriting}
            className="px-6 py-3 rounded-md font-mono text-[0.85rem] font-semibold bg-[#8fd19e] text-[#182019] hover:opacity-90 transition-opacity"
          >
            start writing — it's free
          </Link>
        </div>
      </section>

      <footer className="bg-[#23252e] border-t border-[#383a46]">
        <div className="flex justify-between px-7 py-3 font-mono text-[0.75rem] text-[#5a5c6b] flex-wrap gap-2.5 max-w-[1080px] mx-auto">
          <div>
            <span className="text-[#8fd19e]">⌥ main</span> &nbsp; devconnect
          </div>
          <div>UTF-8 · Ln 1, Col 1 · React · Express · MongoDB</div>
        </div>
      </footer>
    </>
  );
}
