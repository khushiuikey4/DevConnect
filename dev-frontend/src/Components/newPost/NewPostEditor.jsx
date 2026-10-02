import { useMemo, useState, useEffect } from "react";

/**
 * DevConnect — New Post Editor
 * Title, excerpt, markdown toolbar (with live word count / read
 * time), and the content textarea. Fully controlled — all values
 * and change handlers come from the parent (NewPostBody).
 *
 * Usage:
 *   import NewPostEditor from "./NewPostEditor";
 *   <NewPostEditor
 *     title={title}
 *     excerpt={excerpt}
 *     content={content}
 *     onTitleChange={(value) => ...}
 *     onExcerptChange={(value) => ...}
 *     onContentChange={(value) => ...}
 *   />
 */

const TOOLBAR_BUTTONS = [
  { key: "bold", label: "B", className: "font-bold" },
  { key: "italic", label: "I", className: "italic" },
  { key: "code", label: "{ }" },
  { key: "link", label: "🔗" },
  { key: "quote", label: "❝" },
  { key: "list", label: "•" },
];

function estimateReadTime(wordCount) {
  if (wordCount === 0) return "<1 min";
  return `${Math.ceil(wordCount / 200)} min`;
}

// input placeholders never wrap to a second line, so a long string
// just gets clipped by the input's width on narrow screens — swap
// to a shorter version instead of relying on font-size alone
function useIsNarrowScreen(breakpointPx = 400) {
  const [isNarrow, setIsNarrow] = useState(
    () => typeof window !== "undefined" && window.innerWidth < breakpointPx
  );

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth < breakpointPx);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpointPx]);

  return isNarrow;
}

export default function NewPostEditor({
  title,
  excerpt,
  content,
  onTitleChange,
  onExcerptChange,
  onContentChange,
}) {
  const wordCount = useMemo(() => {
    const trimmed = content.trim();
    return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
  }, [content]);

  const readTime = estimateReadTime(wordCount);
  const isNarrow = useIsNarrowScreen();

  return (
    <div>
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange?.(e.target.value)}
        placeholder="Post title..."
        className="w-full bg-transparent border-none outline-none text-[#e8e9ee] font-sans font-bold text-[1.6rem] sm:text-[2rem] mb-3.5 placeholder:text-[#5a5c6b]"
      />

      <input
        type="text"
        value={excerpt}
        onChange={(e) => onExcerptChange?.(e.target.value)}
        placeholder={
          isNarrow ? "Excerpt (optional)" : "One-line excerpt (optional — shown on the feed card)"
        }
        className="w-full bg-transparent border-none outline-none text-[#8b8d9b] italic text-[0.85rem] sm:text-[0.98rem] pb-4 sm:pb-[18px] border-b border-[#383a46] mb-5 placeholder:text-[#5a5c6b]"
      />

      {/* toolbar */}
      <div className="flex items-center flex-wrap gap-1.5 mb-3.5 pb-3.5 border-b border-[#383a46]">
        {TOOLBAR_BUTTONS.map((btn) => (
          <button
            key={btn.key}
            type="button"
            className={`w-8 h-8 border border-[#383a46] rounded-md bg-[#23252e] text-[#8b8d9b] font-mono text-[0.82rem] flex items-center justify-center hover:text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors ${btn.className || ""}`}
          >
            {btn.label}
          </button>
        ))}
        <span className="font-mono text-[0.74rem] sm:text-[0.76rem] text-[#5a5c6b] sm:ml-auto basis-full sm:basis-auto mt-1.5 sm:mt-0">
          {wordCount} words · {readTime} read
        </span>
      </div>

      {/* content editor */}
      <textarea
        value={content}
        onChange={(e) => onContentChange?.(e.target.value)}
        placeholder={
          "Write in markdown...\n\n## What you'll learn\nStart with a heading, then tell the story — what you built, what broke, what you'd do differently."
        }
        rows={16}
        className="w-full min-h-[320px] sm:min-h-[420px] bg-transparent border-none outline-none resize-y text-[#e8e9ee] font-mono text-[0.88rem] sm:text-[0.92rem] leading-[1.8] placeholder:text-[#5a5c6b]"
      />
    </div>
  );
}
