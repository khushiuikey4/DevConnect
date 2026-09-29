import { useState } from "react";
import DevSidebar from "../Components/DevSidebar";

/**
 * DevConnect — Dev Feed (feed.js)
 * The main feed content (greeting, search, sort, filters, posts,
 * load-more) rendered side by side with DevSidebar.
 *
 * Usage:
 *   import DevFeed from "./DevFeed";
 *   <DevFeed
 *     userName="you"
 *     posts={posts}
 *     tags={["react", "nodejs", "mongodb", "typescript"]}
 *     onSearch={(query) => ...}
 *     onSortChange={(sort) => ...}
 *     onFilterChange={(tag) => ...}
 *     onLike={(postId) => ...}
 *     onSave={(postId) => ...}
 *     onPostClick={(postId) => ...}
 *     onLoadMore={() => ...}
 *   />
 *
 * Note: since DevSidebar is rendered here directly, don't also
 * pass a sidebar to DevContainer for this page — just:
 *   <DevContainer activeTab="feed" user={user}>
 *     <DevFeed />
 *   </DevContainer>
 */

const SORTS = [
  { key: "following", label: "following" },
  { key: "latest", label: "latest" },
  { key: "trending", label: "trending" },
];

const AVATAR_GRADIENTS = [
  "from-[#b39ddb] to-[#7eb6e0]",
  "from-[#e8a87c] to-[#8fd19e]",
  "from-[#7eb6e0] to-[#8fd19e]",
];

const SAMPLE_POSTS = [
  {
    id: "1",
    author: "maya_codes",
    avatar: 0,
    readTime: "4 min read",
    postedAgo: "2h ago",
    title: "Connecting my React frontend to Express without losing my mind",
    excerpt:
      "Everything I wish someone had told me about CORS, proxies, and state before I started my first full-stack project.",
    tags: ["react", "express"],
    likeCount: 42,
    liked: true,
    commentCount: 8,
    saved: false,
  },
  {
    id: "2",
    author: "devrishab",
    avatar: 1,
    readTime: "7 min read",
    postedAgo: "5h ago",
    title: "JWT auth from scratch: the parts tutorials skip",
    excerpt:
      "Refresh tokens, httpOnly cookies, and the authorization check that actually matters once your app has more than one user.",
    tags: ["nodejs", "auth"],
    likeCount: 96,
    liked: false,
    commentCount: 21,
    saved: true,
  },
  {
    id: "3",
    author: "lianwrites",
    avatar: 2,
    readTime: "5 min read",
    postedAgo: "1d ago",
    title: "Why I moved my state out of props and into Redux Toolkit",
    excerpt:
      "A small project didn't need it. This one did. Here's the exact moment I could feel the difference.",
    tags: ["redux", "react"],
    likeCount: 17,
    liked: false,
    commentCount: 3,
    saved: false,
  },
];

function PostCard({ post, onLike, onSave, onClick }) {
  return (
    <div className="bg-[#23252e] border border-[#383a46] rounded-[10px] p-[22px_24px] mb-4">
      <div className="flex items-center gap-2.5 text-[0.8rem] text-[#5a5c6b] mb-3.5">
        <span
          className={`w-[22px] h-[22px] rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[post.avatar % AVATAR_GRADIENTS.length]}`}
        />
        <span>{post.author}</span>
        <span>· {post.readTime} · {post.postedAgo}</span>
      </div>

      <h3
        onClick={() => onClick?.(post.id)}
        className="text-[1.08rem] font-semibold mb-2 cursor-pointer hover:text-[#8fd19e] transition-colors"
      >
        {post.title}
      </h3>
      <p className="text-[#8b8d9b] text-[0.88rem] leading-[1.6] mb-4">
        {post.excerpt}
      </p>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[0.72rem] px-2.5 py-[3px] rounded text-[#8fd19e] bg-[#8fd19e1a]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => onLike?.(post.id)}
            className={`font-mono text-[0.78rem] flex items-center gap-1.5 ${post.liked ? "text-[#e18a8a]" : "text-[#5a5c6b] hover:text-[#e8e9ee]"
              }`}
          >
            {post.liked ? "♥" : "♡"} {post.likeCount}
          </button>
          <button
            onClick={() => onClick?.(post.id)}
            className="font-mono text-[0.78rem] text-[#5a5c6b] hover:text-[#e8e9ee] flex items-center gap-1.5"
          >
            💬 {post.commentCount}
          </button>
          <button
            onClick={() => onSave?.(post.id)}
            className={`font-mono text-[0.78rem] ${post.saved ? "text-[#e8a87c]" : "text-[#5a5c6b] hover:text-[#e8e9ee]"
              }`}
          >
            {post.saved ? "🔖 saved" : "🔖 save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DevFeed({
  userName = "you",
  posts = SAMPLE_POSTS,
  tags = ["react", "nodejs", "mongodb", "typescript"],
  activeSort = "following",
  activeTag = "all",
  onSearch,
  onSortChange,
  onFilterChange,
  onLike,
  onSave,
  onPostClick,
  onLoadMore,
  onFollow,
  onTagClick,
}) {
  const [query, setQuery] = useState("");

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-10 items-start">
      {/* main feed column */}
      <div>
        <div className="font-mono text-[0.82rem] text-[#5a5c6b] mb-1.5">
          // <span className="text-[#8fd19e]">welcome back</span>, @{userName}{" "}
          — here's what's new
        </div>
        <h1 className="text-[1.7rem] font-semibold mb-7 tracking-[-0.01em] text-[#e8e9ee]">
          Your feed
        </h1>

        {/* search */}
        <div className="flex items-center gap-2.5 bg-[#23252e] border border-[#383a46] rounded-lg px-4 py-2.5 mb-5">
          <span className="text-[#5a5c6b] text-[0.9rem]">⌕</span>
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="search posts, tags, or authors..."
            className="flex-1 bg-transparent border-none outline-none text-[#e8e9ee] font-mono text-[0.85rem] placeholder:text-[#5a5c6b]"
          />
        </div>

        {/* sort tabs */}
        <div className="flex gap-0 mb-4 border-b border-[#383a46]">
          {SORTS.map((sort) => (
            <button
              key={sort.key}
              onClick={() => onSortChange?.(sort.key)}
              className={`font-mono text-[0.8rem] py-2 mr-[22px] border-b-2 transition-colors ${activeSort === sort.key
                ? "text-[#e8e9ee] border-[#8fd19e]"
                : "text-[#5a5c6b] border-transparent hover:text-[#8b8d9b]"
                }`}
            >
              {sort.label}
            </button>
          ))}
        </div>

        {/* tag filter chips */}
        <div className="flex gap-2.5 mb-6 flex-wrap">
          <button
            onClick={() => onFilterChange?.("all")}
            className={`font-mono text-[0.78rem] px-3.5 py-1.5 rounded-full border transition-colors ${activeTag === "all"
              ? "bg-[#8fd19e] text-[#182019] border-[#8fd19e] font-semibold"
              : "border-[#383a46] text-[#8b8d9b] hover:text-[#e8e9ee]"
              }`}
          >
            all
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onFilterChange?.(tag)}
              className={`font-mono text-[0.78rem] px-3.5 py-1.5 rounded-full border transition-colors ${activeTag === tag
                ? "bg-[#8fd19e] text-[#182019] border-[#8fd19e] font-semibold"
                : "border-[#383a46] text-[#8b8d9b] hover:text-[#e8e9ee]"
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* posts */}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={onLike}
            onSave={onSave}
            onClick={onPostClick}
          />
        ))}

        <button
          onClick={onLoadMore}
          className="block w-full text-center py-3.5 mt-1 bg-[#23252e] border border-[#383a46] rounded-lg text-[#8b8d9b] font-mono text-[0.82rem] hover:text-[#e8e9ee] hover:border-[#5a5c6b] transition-colors"
        >
          load more posts ↓
        </button>
      </div>

      {/* sidebar column */}
      <DevSidebar onFollow={onFollow} onTagClick={onTagClick} />
    </div>
  );
}
