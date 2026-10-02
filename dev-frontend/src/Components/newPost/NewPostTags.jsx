import { useState } from "react";

/**
 * DevConnect — New Post Tags
 * Tag chips + an add-tag input, capped at maxTags. Fully
 * controlled — the tags array and its change handler come from
 * the parent (NewPostBody); only the input's in-progress text is
 * local state, since the parent doesn't need to know what's being
 * typed until a tag is actually added.
 *
 * Usage:
 *   import NewPostTags from "./NewPostTags";
 *   <NewPostTags
 *     tags={tags}
 *     maxTags={5}
 *     onTagsChange={(newTags) => ...}
 *   />
 */

export default function NewPostTags({ tags, maxTags = 5, onTagsChange }) {
  const [tagInput, setTagInput] = useState("");

  const atLimit = tags.length >= maxTags;

  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase();
    if (!clean || atLimit || tags.includes(clean)) return;
    onTagsChange?.([...tags, clean]);
    setTagInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tag) => {
    onTagsChange?.(tags.filter((t) => t !== tag));
  };

  return (
    <div className="bg-[#23252e] border border-[#383a46] rounded-[10px] p-[18px] sm:p-5">
      <h4 className="font-mono text-[0.78rem] text-[#8fd19e] font-medium mb-3.5">
        // tags
      </h4>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {tags.map((tag) => (
            <span
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
          placeholder={atLimit ? `max ${maxTags} tags reached` : "add a tag..."}
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
        up to {maxTags} tags
      </div>
    </div>
  );
}
