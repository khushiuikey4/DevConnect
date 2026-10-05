import { useState, useMemo } from "react";

/**
 * DevConnect — Dev Saved (saved.js)
 * Everything from the outer page container down to the saved
 * posts list — no header included (bring your own).
 *
 * Owns its own background + max-width wrapper, so it renders
 * correctly on its own, same as DevMyPosts.
 *
 * Usage:
 *   import DevSaved from "./DevSaved";
 *   <DevSaved
 *     posts={savedPosts}
 *     onUnsave={(id) => ...}
 *     onPostClick={(id) => ...}
 *   />
 */

const AVATAR_GRADIENTS = [
  "from-[#b39ddb] to-[#7eb6e0]",
  "from-[#e8a87c] to-[#8fd19e]",
  "from-[#7eb6e0] to-[#8fd19e]",
];

const SAMPLE_POSTS = [
  {
    id: "1",
    author: "devrishab",
    avatar: 0,
    title: "JWT auth from scratch: the parts tutorials skip",
    excerpt:
      "Refresh tokens, httpOnly cookies, and the authorization check that actually matters once your app has more than one user.",
    tags: ["nodejs", "auth"],
    savedAgo: "saved 3 days ago",
  },
  {
    id: "2",
    author: "codewithzee",
    avatar: 1,
    title: "Docker for beginners: the mental model that finally clicked",
    excerpt:
      "Forget the analogies. Here's how I actually think about images, containers, and volumes now.",
    tags: ["docker"],
    savedAgo: "saved 1 week ago",
  },
  {
    id: "3",
    author: "maya_codes",
    avatar: 2,
    title: "Connecting my React frontend to Express without losing my mind",
    excerpt:
      "Everything I wish someone had told me about CORS, proxies, and state before I started my first full-stack project.",
    tags: ["react", "express"],
    savedAgo: "saved 2 weeks ago",
  },
];

function SavedRow({ post, onUnsave, onPostClick }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4.5 items-start bg-[#23252e] border border-[#383a46] rounded-[10px] p-5 mb-3">
      <div>
        <div className="flex items-center gap-2.5 text-[0.8rem] text-[#5a5c6b] mb-2.5">
          <span
            className={`w-5 h-5 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[post.avatar % AVATAR_GRADIENTS.length]}`}
          />
          <span>{post.author}</span>
        </div>

        <h3
          onClick={() => onPostClick?.(post.id)}
          className="text-[1.02rem] font-semibold mb-2 cursor-pointer hover:text-[#8fd19e] transition-colors"
        >
          {post.title}
        </h3>
        <p className="text-[#8b8d9b] text-[0.86rem] leading-[1.55] mb-3">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[0.72rem] text-[#8fd19e] bg-[#8fd19e1a] px-2.5 py-[3px] rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="font-mono text-[0.74rem] text-[#5a5c6b]">
            {post.savedAgo}
          </span>
        </div>
      </div>

      <div>
        <button
          onClick={() => onUnsave?.(post.id)}
          className="font-mono text-[0.76rem] px-3.5 py-1.5 rounded-md border border-[#383a46] text-[#e8a87c] bg-[#e8a87c14] hover:border-[#e8a87c] transition-colors whitespace-nowrap"
        >
          🔖 unsave
        </button>
      </div>
    </div>
  );
}

export default function DevSaved({
  posts = SAMPLE_POSTS,
  onUnsave,
  onPostClick,
}) {
  const [activeTag, setActiveTag] = useState("all");

  const tags = useMemo(() => {
    const unique = new Set();
    posts.forEach((p) => p.tags.forEach((t) => unique.add(t)));
    return Array.from(unique);
  }, [posts]);

  const filteredPosts = useMemo(
    () =>
      activeTag === "all"
        ? posts
        : posts.filter((p) => p.tags.includes(activeTag)),
    [posts, activeTag]
  );

  return (
    <div className="min-h-screen bg-[#1e1f26] text-[#e8e9ee]">
      <main className="max-w-[1080px] mx-auto px-7 py-9 pb-20">
        <div className="font-mono text-[0.82rem] text-[#5a5c6b] mb-1.5">
          // <span className="text-[#8fd19e]">for later</span>
        </div>

        <div className="flex justify-between items-end flex-wrap gap-4 mb-6">
          <h1 className="text-[1.7rem] font-semibold tracking-[-0.01em] m-0">
            Saved posts
          </h1>
          <div className="font-mono text-[0.8rem] text-[#8b8d9b]">
            <b className="text-[#8fd19e] font-semibold">{posts.length}</b>{" "}
            saved
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex gap-2.5 mb-6 flex-wrap">
            <button
              onClick={() => setActiveTag("all")}
              className={`font-mono text-[0.78rem] px-3.5 py-1.5 rounded-full border transition-colors ${
                activeTag === "all"
                  ? "bg-[#8fd19e] text-[#182019] border-[#8fd19e] font-semibold"
                  : "border-[#383a46] text-[#8b8d9b] hover:text-[#e8e9ee]"
              }`}
            >
              all
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`font-mono text-[0.78rem] px-3.5 py-1.5 rounded-full border transition-colors ${
                  activeTag === tag
                    ? "bg-[#8fd19e] text-[#182019] border-[#8fd19e] font-semibold"
                    : "border-[#383a46] text-[#8b8d9b] hover:text-[#e8e9ee]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 px-5 border border-dashed border-[#383a46] rounded-[10px]">
            <div className="font-mono text-[0.9rem] text-[#8fd19e] mb-2.5">
              // nothing here yet
            </div>
            <p className="text-[0.9rem] text-[#8b8d9b]">
              {activeTag === "all"
                ? "Posts you save will show up here."
                : `No saved posts tagged "${activeTag}".`}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <SavedRow
              key={post.id}
              post={post}
              onUnsave={onUnsave}
              onPostClick={onPostClick}
            />
          ))
        )}
      </main>
    </div>
  );
}
