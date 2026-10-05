import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * DevConnect — Landing Page Header
 * Editor-chrome style nav: traffic-light dots + path bar,
 * then a tab-style nav bar with links and auth CTAs.
 *
 * Usage:
 *   import LandingPageHeader from "./LandingPageHeader";
 *   <LandingPageHeader onSignIn={...} onStartWriting={...} />
 */

export default function LandingPageHeader({ onSignIn, onStartWriting }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("readme.md");
  return (
    <header className="bg-[#23252e] border-b border-[#383a46] sticky top-0 z-10 backdrop-blur">
      {/* chrome bar */}
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-[#383a46]">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e18a8a]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#e8a87c]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#8fd19e]" />
        </div>
        <span className="ml-3.5 font-mono text-[0.78rem] text-[#5a5c6b]">
          ~/devconnect/{activeTab}
        </span>
      </div>

      {/* nav row */}
      <nav className="flex items-center max-w-[1080px] mx-auto px-5">
        <a href="#readme" onClick={() => {
          setActiveTab("readme.md")
        }} className="flex items-center gap-2 py-3.5 px-4 font-mono text-[0.82rem] text-[#e8e9ee] border-r border-[#383a46]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e8a87c]" />
          readme.md
        </a>

        <div className="hidden md:flex flex-1">
          <a onClick={() => {
            setActiveTab("explore.js")
          }}
            href="#explore"
            className="py-3.5 px-4 font-mono text-[0.8rem] text-[#8b8d9b] border-r border-[#383a46] hover:text-[#e8e9ee] hover:bg-[#2a2c37] transition-colors"
          >
            explore.js
          </a>
          <a onClick={() => {
            setActiveTab("how-it-works.js")
          }}
            href="#work"
            className="py-3.5 px-4 font-mono text-[0.8rem] text-[#8b8d9b] border-r border-[#383a46] hover:text-[#e8e9ee] hover:bg-[#2a2c37] transition-colors"
          >
            how-it-works.js
          </a>
        </div>

        <div className="hidden md:flex items-center gap-2.5 ml-auto py-3">
          <Link to='/authenticationPage'
            onClick={onSignIn}
            className="px-4 py-2 font-mono text-[0.8rem] rounded border border-[#383a46] text-[#8b8d9b] hover:text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors"
          >
            sign in / sign up
          </Link>
          <a
            href="#write"
            onClick={() => {
              setActiveTab("write")
            }}
            className="px-4 py-2 font-mono text-[0.8rem] rounded border border-[#8fd19e] bg-[#8fd19e] text-[#182019] font-semibold hover:opacity-90 transition-opacity"
          >
            write
          </a>
        </div>

        {/* mobile menu toggle */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden ml-auto py-3.5 px-4 text-[#e8e9ee] text-lg"
          aria-label="menu"
        >
          ☰
        </button>
      </nav>

      {/* mobile dropdown */}
      {
        menuOpen && (
          <div className="md:hidden flex flex-col border-t border-[#383a46] bg-[#23252e]">
            <a href="#explore" className="py-3 px-5 font-mono text-[0.8rem] text-[#8b8d9b] border-b border-[#383a46]">
              explore.js
            </a>
            <a href="#how" className="py-3 px-5 font-mono text-[0.8rem] text-[#8b8d9b] border-b border-[#383a46]">
              how-it-works.js
            </a>
            <div className="flex gap-2.5 p-4">
              <Link to="/authenticationPage"
                onClick={onSignIn}
                className="flex-1 px-4 py-2 font-mono text-[0.8rem] rounded border border-[#383a46] text-[#8b8d9b]"
              >
                sign in / sign up
              </Link>
              <button
                onClick={onStartWriting}
                className="flex-1 px-4 py-2 font-mono text-[0.8rem] rounded bg-[#8fd19e] text-[#182019] font-semibold"
              >
                write
              </button>
            </div>
          </div>
        )
      }
    </header >
  );
}
