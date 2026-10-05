import { useState, useMemo } from "react";

/**
 * DevConnect — Dev My Posts (my-posts.js)
 * Everything from the outer page container down to the post list —
 * no header included (bring your own, e.g. DevHeader/DevContainer).
 *
 * This component owns its own background + max-width wrapper, so
 * it renders correctly even if dropped somewhere with no parent
 * styling (same lesson as the DevFeed white-background bug).
 *
 * Usage:
 *   import DevMyPosts from "./DevMyPosts";
 *   <DevMyPosts
 *     posts={posts}
 *     onEdit={(id) => ...}
 *     onDelete={(id) => ...}
 *     onContinueWriting={(id) => ...}
 *   />
 */

const SAMPLE_POSTS = [
  {
    id: "1",
    status: "published",
    date: "March 12, 2026",
    title: "Connecting my React frontend to Express without losing my mind",
    excerpt:
      "Everything I wish someone had told me about CORS, proxies, and state before I started my first full-stack project.",
    tags: ["react", "express"],
    likes: 42,
    comments: 8,
    views: "1.2k",
  },
  {
    id: "2",
    status: "draft",
    date: "last edited 2 days ago",
    title: "Why my Docker container kept dying (and what fixed it)",
    excerpt:
      "Still working through this one — notes on memory limits and restart policies so far.",
    tags: ["docker"],
    likes: null,
    comments: null,
    views: null,
  },
  {
    id: "3",
    status: "published",
    date: "Feb 28, 2026",
    title: "JWT auth from scratch: the parts tutorials skip",
    excerpt:
      "Refresh tokens, httpOnly cookies, and the authorization check that actually matters once your app has more than one user.",
    tags: ["nodejs", "auth"],
    likes: 96,
    comments: 21,
    views: "3.4k",
  },
  {
    id: "4",
    status: "published",
    date: "Feb 10, 2026",
    title: "Why I moved my state out of props and into Redux Toolkit",
    excerpt:
      "A small project didn't need it. This one did. Here's the exact moment I felt the difference.",
    tags: ["redux", "react"],
    likes: 17,
    comments: 3,
    views: "640",
  },
  {
    id: "5",
    status: "published",
    date: "Jan 22, 2026",
    title: "My first full-stack CRUD app: what I'd do differently",
    excerpt:
      "Looking back at my to-do list app a few months later — the parts that held up and the parts I'd rebuild.",
    tags: ["beginners", "mongodb"],
    likes: 31,
    comments: 6,
    views: "980",
  },
];

const FILTERS = [
  { key: "all", label: "all" },
  { key: "published", label: "published" },
  { key: "draft", label: "drafts" },
];

function PostRow({ post, onEdit, onDelete, onContinueWriting }) {
  const isDraft = post.status === "draft";

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5 items-start bg-[#23252e] border border-[#383a46] rounded-[10px] p-[22px_24px] mb-3.5">
      <div>
        <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
          <span
            className={`font-mono text-[0.7rem] px-2.5 py-[3px] rounded font-medium ${isDraft
                ? "text-[#e8a87c] bg-[#e8a87c1a]"
                : "text-[#8fd19e] bg-[#8fd19e1a]"
              }`}
          >
            {post.status}
          </span>
          <span className="font-mono text-[0.76rem] text-[#5a5c6b]">
            {post.date}
          </span>
        </div>

        <h3 className="text-[1.05rem] font-semibold mb-2 text-[#e8e9ee]">
          {post.title}
        </h3>
        <p className="text-[#8b8d9b] text-[0.87rem] leading-[1.55] mb-3.5">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[0.72rem] text-[#8b8d9b] border border-[#383a46] px-2.5 py-[3px] rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex gap-4 font-mono text-[0.76rem] text-[#5a5c6b]">
            {isDraft ? (
              <span>not published yet</span>
            ) : (
              <>
                <span>♥ {post.likes}</span>
                <span>💬 {post.comments}</span>
                <span>👁 {post.views}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-row md:flex-col gap-2">
        <button
          onClick={() =>
            isDraft ? onContinueWriting?.(post.id) : onEdit?.(post.id)
          }
          className="flex-1 md:flex-none font-mono text-[0.76rem] px-3.5 py-1.5 rounded-md border border-[#383a46] text-[#8b8d9b] hover:text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors whitespace-nowrap"
        >
          {isDraft ? "continue writing" : "edit"}
        </button>
        <button
          onClick={() => onDelete?.(post.id)}
          className="flex-1 md:flex-none font-mono text-[0.76rem] px-3.5 py-1.5 rounded-md border border-[#383a46] text-[#8b8d9b] hover:text-[#e18a8a] hover:border-[#e18a8a] transition-colors"
        >
          delete
        </button>
      </div>
    </div>
  );
}

export default function DevMyPosts({
  userName = "you",
  posts = SAMPLE_POSTS,
  onEdit,
  onDelete,
  onContinueWriting,
}) {
  const [filter, setFilter] = useState("all");

  const counts = useMemo(
    () => ({
      all: posts.length,
      published: posts.filter((p) => p.status === "published").length,
      draft: posts.filter((p) => p.status === "draft").length,
    }),
    [posts]
  );

  const totalLikes = useMemo(
    () => posts.reduce((sum, p) => sum + (p.likes || 0), 0),
    [posts]
  );

  const filteredPosts = useMemo(
    () =>
      filter === "all" ? posts : posts.filter((p) => p.status === filter),
    [posts, filter]
  );

  return (
    <div className="min-h-screen bg-[#1e1f26] text-[#e8e9ee]">
      <main className="max-w-[1080px] mx-auto px-7 py-9 pb-20">
        <div className="font-mono text-[0.82rem] text-[#5a5c6b] mb-1.5">
          // <span className="text-[#8fd19e]">your published work</span>
        </div>

        <div className="flex justify-between items-end flex-wrap gap-4 mb-7">
          <h1 className="text-[1.7rem] font-semibold tracking-[-0.01em] m-0">
            My posts
          </h1>
          <div className="flex gap-6 font-mono text-[0.8rem] text-[#8b8d9b] flex-wrap">
            <span>
              <b className="text-[#8fd19e] font-semibold">
                {counts.published}
              </b>{" "}
              published
            </span>
            <span>
              <b className="text-[#8fd19e] font-semibold">{counts.draft}</b>{" "}
              draft{counts.draft !== 1 ? "s" : ""}
            </span>
            <span>
              <b className="text-[#8fd19e] font-semibold">{totalLikes}</b>{" "}
              total likes
            </span>
          </div>
        </div>

        <div className="flex gap-0 mb-6 border-b border-[#383a46]">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`font-mono text-[0.8rem] py-2 mr-[22px] border-b-2 transition-colors ${filter === f.key
                  ? "text-[#e8e9ee] border-[#8fd19e]"
                  : "text-[#5a5c6b] border-transparent hover:text-[#8b8d9b]"
                }`}
            >
              {f.label}{" "}
              <span className="text-[0.74rem] text-[#5a5c6b]">
                ({counts[f.key]})
              </span>
            </button>
          ))}
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 px-5 border border-dashed border-[#383a46] rounded-[10px] text-[#5a5c6b]">
            <div className="font-mono text-[0.9rem] text-[#8fd19e] mb-2.5">
              // nothing here yet
            </div>
            <p className="text-[0.9rem] mb-4">
              {filter === "draft"
                ? "No drafts in progress."
                : "No posts in this category yet."}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostRow
              key={post.id}
              post={post}
              onEdit={onEdit}
              onDelete={onDelete}
              onContinueWriting={onContinueWriting}
            />
          ))
        )}
      </main>
    </div>
  );
}
