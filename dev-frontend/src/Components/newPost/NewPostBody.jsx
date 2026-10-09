import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addPostToServer } from "../../services/PostCrud";

const MAX_TAGS = 5;

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

function useIsNarrowScreen(breakpointPx = 400) {
  const [isNarrow, setIsNarrow] = useState(
    () =>
      typeof window !== "undefined" &&
      window.innerWidth < breakpointPx
  );

  useEffect(() => {
    const handleResize = () =>
      setIsNarrow(window.innerWidth < breakpointPx);

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [breakpointPx]);

  return isNarrow;
}

export default function NewPostBody({
  onPublish,
  onSaveDraft,
  onDirtyChange,
  tab,
  setTab,
}) {
  // -------------------------
  // POST STATE
  // -------------------------

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState(["react", "express"]);

  // -------------------------
  // TAG INPUT STATE
  // -------------------------

  const [tagInput, setTagInput] = useState("");

  // -------------------------
  // EDITOR LOGIC
  // -------------------------

  const wordCount = useMemo(() => {
    const trimmed = content.trim();

    return trimmed === ""
      ? 0
      : trimmed.split(/\s+/).length;
  }, [content]);

  const readTime = estimateReadTime(wordCount);

  const isNarrow = useIsNarrowScreen();

  // -------------------------
  // COMMON LOGIC
  // -------------------------

  const markDirty = () => onDirtyChange?.(true);


  // -------------------------
  // TAG LOGIC
  // -------------------------

  const atLimit = tags.length >= MAX_TAGS;

  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase();

    if (!clean || atLimit || tags.includes(clean)) return;

    setTags([...tags, clean]);
    setTagInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const navigate = useNavigate();

  const handleOnAddPost = async (e) => {
    e.preventDefault();

    // the button that triggered the submit: "published" or "draft"
    const status = e.nativeEvent.submitter?.value || "draft";

    const postInfo = { title, excerpt, content, tags, status };
    const response = await addPostToServer(postInfo);

    if (response?.success) {
      onDirtyChange?.(false);
      navigate("/devHomePage?tab=my-posts");
    } else {
      console.error(response?.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1f26] text-[#e8e9ee]">
      <form onSubmit={handleOnAddPost}>

        <main className="max-w-[860px] mx-auto px-5 sm:px-7 py-7 sm:py-9 pb-16">

          {/* EDITOR */}

          <input
            name="title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              markDirty();
            }}
            placeholder="Post title..."
            className="w-full bg-transparent border-none outline-none text-[#e8e9ee] font-sans font-bold text-[1.6rem] sm:text-[2rem] mb-3.5 placeholder:text-[#5a5c6b]"
          />

          <input
            name="excerpt"
            type="text"
            value={excerpt}
            onChange={(e) => {
              setExcerpt(e.target.value);
              markDirty();
            }}
            placeholder={
              isNarrow
                ? "Excerpt (optional)"
                : "One-line excerpt (optional — shown on the feed card)"
            }
            className="w-full bg-transparent border-none outline-none text-[#8b8d9b] italic text-[0.85rem] sm:text-[0.98rem] pb-4 sm:pb-[18px] border-b border-[#383a46] mb-5 placeholder:text-[#5a5c6b]"
          />

          {/* TOOLBAR */}

          <div className="flex items-center flex-wrap gap-1.5 mb-3.5 pb-3.5 border-b border-[#383a46]">

            {TOOLBAR_BUTTONS.map((btn) => (
              <button
                key={btn.key}
                type="button"
                className={`w-8 h-8 border border-[#383a46] rounded-md bg-[#23252e] text-[#8b8d9b] font-mono text-[0.82rem] flex items-center justify-center hover:text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors ${btn.className || ""
                  }`}
              >
                {btn.label}
              </button>
            ))}

            <span className="font-mono text-[0.74rem] sm:text-[0.76rem] text-[#5a5c6b] sm:ml-auto basis-full sm:basis-auto mt-1.5 sm:mt-0">
              {wordCount} words · {readTime} read
            </span>

          </div>

          {/* CONTENT */}

          <textarea
            name="content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              markDirty();
            }}
            placeholder={
              "Write in markdown...\n\n## What you'll learn\nStart with a heading, then tell the story — what you built, what broke, what you'd do differently."
            }
            rows={16}
            className="w-full min-h-[320px] sm:min-h-[420px] bg-transparent border-none outline-none resize-y text-[#e8e9ee] font-mono text-[0.88rem] sm:text-[0.92rem] leading-[1.8] placeholder:text-[#5a5c6b]"
          />

          <div className="flex flex-col gap-4 mt-7">

            {/* TAGS */}

            <div className="bg-[#23252e] border border-[#383a46] rounded-[10px] p-[18px] sm:p-5">

              <h4 className="font-mono text-[0.78rem] text-[#8fd19e] font-medium mb-3.5">
              // tags
              </h4>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2.5">

                  {tags.map((tag) => (
                    <span
                      name="tags"
                      value={tag}
                      key={tag}
                      className="flex items-center gap-1.5 font-mono text-[0.76rem] text-[#8fd19e] bg-[#8fd19e1a] px-2.5 py-1 rounded-md"
                    >
                      {tag}

                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-[#5a5c6b] hover:text-[#e8e9ee]"
                        aria-label={`remove ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}

                </div>
              )}

              <div className="flex gap-2">

                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    atLimit
                      ? `max ${MAX_TAGS} tags reached`
                      : "add a tag..."
                  }
                  disabled={atLimit}
                  className="flex-1 min-w-0 bg-[#2a2c37] border border-[#383a46] rounded-md px-2.5 py-2 text-[#e8e9ee] font-mono text-[0.8rem] outline-none placeholder:text-[#5a5c6b] disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={atLimit}
                  className="shrink-0 px-3.5 py-2 rounded-md border border-[#383a46] bg-[#2a2c37] text-[#8b8d9b] font-mono text-[0.78rem] hover:text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors disabled:opacity-50"
                >
                  add
                </button>

              </div>

              <div className="text-[0.72rem] text-[#5a5c6b] mt-2">
                up to {MAX_TAGS} tags
              </div>

            </div>

            {/* PUBLISH */}

            <div className="bg-[#23252e] border border-[#383a46] rounded-[10px] p-[18px] sm:p-5">

              <h4 className="font-mono text-[0.78rem] text-[#8fd19e] font-medium mb-3.5">
              // publish
              </h4>

              <div className="flex flex-col sm:flex-row gap-2.5">

                <button
                  name="status" value="published"
                  type="submit"
                  className=" flex-1 w-full py-3 rounded-md bg-[#8fd19e] text-[#182019] font-mono text-[0.86rem] font-semibold hover:opacity-90 transition-opacity"
                >
                  publish post
                </button>


                <button
                  name="status" value="draft"
                  type="submit"
                  className="w-full flex-1 py-[11px] rounded-md border border-[#383a46] text-[#8b8d9b] font-mono text-[0.82rem] hover:text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors"
                >
                  save as draft
                </button>

              </div>

              <div className="text-[0.72rem] text-[#5a5c6b] mt-3">
                drafts are only visible to you
              </div>

            </div>

          </div>

        </main>
      </form>

    </div>
  );
}