/**
 * DevConnect — New Post Header
 * The chrome bar for the Create Post page: traffic-light dots,
 * path, the "new-post.md" unsaved-file indicator, and a back link.
 *
 * Note: named NewPostHeader (capital N), not newPostHeader —
 * React treats a lowercase-first component name as a plain HTML
 * tag, so <newPostHeader /> would silently fail to render. Same
 * reason LandingPageHeader got capitalized earlier.
 *
 * Usage:
 *   import NewPostHeader from "./NewPostHeader";
 *   <NewPostHeader isDirty={true} onBack={() => navigate(-1)} />
 */
import { Link } from "react-router-dom";

export default function NewPostHeader({ isDirty = false, onBack }) {
  return (
    <div className="bg-[#23252e] border-b border-[#383a46] sticky top-0 z-10">
      <div className="flex items-center gap-2.5 px-5 py-3">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e18a8a]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#e8a87c]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#8fd19e]" />
        </div>

        <span className="ml-3.5 font-mono text-[0.78rem] text-[#5a5c6b]">
          ~/devconnect/
        </span>

        <div className="flex items-center gap-1.5 font-mono text-[0.78rem] text-[#8b8d9b]">
          {isDirty && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8a87c]" />
          )}
          new-post.md
        </div>

        <Link to="/devHomePage" className="ml-auto px-4 py-2">
          <button
            onClick={onBack}
            className="ml-auto px-4 py-2 font-mono text-[0.8rem] border border-[#383a46] rounded text-[#8b8d9b] hover:text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors"
          >
            ← back
          </button>
        </Link>
      </div>
    </div>
  );
}
