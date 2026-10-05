import { useState } from "react";

/**
 * DevConnect — Dev Explore (explore.js)
 * Everything from the outer page container down to the post grid —
 * no header included (bring your own).
 *
 * Owns its own background + max-width wrapper, same pattern as
 * DevMyPosts and DevSaved. Unlike DevFeed, there's no "following"
 * concept here — this is the public, unpersonalized browse page.
 *
 * Usage:
 *   import DevExplore from "./DevExplore";
 *   <DevExplore
 *     topics={topics}
 *     posts={posts}
 *     onSearch={(q) => ...}
 *     onTopicClick={(tag) => ...}
 *     onSortChange={(sort) => ...}
 *     onPostClick={(id) => ...}
 *     onLoadMore={() => ...}
 *   />
 */

const SORTS = [
  { key: "latest", label: "latest" },
  { key: "trending", label: "trending" },
];

const AVATAR_GRADIENTS = [
  "from-[#b39ddb] to-[#7eb6e0]",
  "from-[#e8a87c] to-[#8fd19e]",
  "from-[#7eb6e0] to-[#8fd19e]",
  "from-[#b39ddb] to-[#e8a87c]",
];

const SAMPLE_TOPICS = [
  { tag: "react", count: "1.2k posts" },
  { tag: "typescript", count: "1.4k posts" },
  { tag: "nodejs", count: "980 posts" },
  { tag: "docker", count: "410 posts" },
];

const SAMPLE_POSTS = [
  {
    id: "1",
    author: "maya_codes",
    avatar: 0,
    readTime: "4 min read",
    title: "Connecting my React frontend to Express without losing my mind",
    excerpt:
      "Everything I wish someone had told me about CORS, proxies, and state before my first full-stack project.",
    tags: ["react", "express"],
    likes: 42,
    comments: 8,
  },
  {
    id: "2",
    author: "devrishab",
    avatar: 1,
    readTime: "7 min read",
    title: "JWT auth from scratch: the parts tutorials skip",
    excerpt:
      "Refresh tokens, httpOnly cookies, and the authorization check that actually matters.",
    tags: ["nodejs", "auth"],
    likes: 96,
    comments: 21,
  },
  {
    id: "3",
    author: "lianwrites",
    avatar: 2,
    readTime: "5 min read",
    title: "Why I moved my state out of props and into Redux Toolkit",
    excerpt:
      "A small project didn't need it. This one did. Here's the exact moment I felt the difference.",
    tags: ["redux", "react"],
    likes: 17,
    comments: 3,
  },
  {
    id: "4",
    author: "codewithzee",
    avatar: 3,
    readTime: "6 min read",
    title: "Docker for beginners: the mental model that finally clicked",
    excerpt:
      "Forget the analogies. Here's how I actually think about images, containers, and volumes now.",
    tags: ["docker"],
    likes: 63,
    comments: 11,
  },
  {
    id: "5",
    author: "arjun_ships",
    avatar: 0,
    readTime: "8 min read",
    title: "Migrating from JavaScript to TypeScript, one file at a time",
    excerpt:
      "The incremental approach that let me keep shipping features while the migration happened in the background.",
    tags: ["typescript"],
    likes: 108,
    comments: 19,
  },
  {
    id: "6",
    author: "priya_codes",
    avatar: 1,
    readTime: "3 min read",
    title: "My first full-stack CRUD app: what I'd do differently",
    excerpt:
      "Looking back at my to-do list app a few months later — the parts that held up and the parts I'd rebuild.",
    tags: ["beginners", "mongodb"],
    likes: 31,
    comments: 6,
  },
];

function TopicCard({ topic, onClick }) {
  return (
    <button
      onClick={() => onClick?.(topic.tag)}
      className="text-left bg-[#23252e] border border-[#383a46] rounded-[10px] p-4.5 hover:border-[#8fd19e] transition-colors"
    >
      <div className="font-mono text-[0.9rem] text-[#e8e9ee] mb-1.5">
        {topic.tag}
      </div>
      <div className="font-mono text-[0.74rem] text-[#5a5c6b]">
        {topic.count}
      </div>
    </button>
  );
}

function PostCard({ post, onClick }) {
  return (
    <div
      onClick={() => onClick?.(post.id)}
      className="bg-[#23252e] border border-[#383a46] rounded-[10px] p-[22px] cursor-pointer hover:border-[#4a4d5c] transition-colors"
    >
      <div className="flex items-center gap-2.5 text-[0.78rem] text-[#5a5c6b] mb-3">
        <span
          className={`w-5 h-5 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[post.avatar % AVATAR_GRADIENTS.length]}`}
        />
        <span>{post.author}</span>
        <span>· {post.readTime}</span>
      </div>

      <h3 className="text-[1rem] font-semibold mb-2 leading-[1.35]">
        {post.title}
      </h3>
      <p className="text-[#8b8d9b] text-[0.85rem] leading-[1.55] mb-3.5">
        {post.excerpt}
      </p>

      <div className="flex justify-between items-center">
        <div className="flex gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[0.7rem] text-[#8fd19e] bg-[#8fd19e1a] px-2 py-[3px] rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="font-mono text-[0.72rem] text-[#5a5c6b] flex gap-2.5">
          <span>♥ {post.likes}</span>
          <span>· 💬 {post.comments}</span>
        </div>
      </div>
    </div>
  );
}

export default function DevExplore({
  topics = SAMPLE_TOPICS,
  posts = SAMPLE_POSTS,
  activeSort = "latest",
  onSearch,
  onTopicClick,
  onSortChange,
  onPostClick,
  onLoadMore,
}) {
  const [query, setQuery] = useState("");

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div className="min-h-screen bg-[#1e1f26] text-[#e8e9ee]">
      <main className="max-w-[1080px] mx-auto px-7 py-9 pb-20">
        <div className="font-mono text-[0.82rem] text-[#5a5c6b] mb-1.5">
          // <span className="text-[#8fd19e]">discover</span> what people are
          building
        </div>
        <h1 className="text-[1.7rem] font-semibold mb-6 tracking-[-0.01em]">
          Explore
        </h1>

        {/* search */}
        <div className="flex items-center gap-2.5 bg-[#23252e] border border-[#383a46] rounded-lg px-4.5 py-3.5 mb-8">
          <span className="text-[#5a5c6b] text-[1rem]">⌕</span>
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="search all posts, tags, or authors..."
            className="flex-1 bg-transparent border-none outline-none text-[#e8e9ee] font-mono text-[0.9rem] placeholder:text-[#5a5c6b]"
          />
        </div>

        {/* topics */}
        <div className="font-mono text-[0.78rem] text-[#8fd19e] mb-3.5">
          // browse by topic
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {topics.map((topic) => (
            <TopicCard key={topic.tag} topic={topic} onClick={onTopicClick} />
          ))}
        </div>

        {/* sort row */}
        <div className="flex justify-between items-center flex-wrap gap-3.5 mb-5">
          <div className="font-mono text-[0.78rem] text-[#8fd19e]">
            // all posts
          </div>
          <div className="flex border-b border-[#383a46]">
            {SORTS.map((sort) => (
              <button
                key={sort.key}
                onClick={() => onSortChange?.(sort.key)}
                className={`font-mono text-[0.8rem] py-2 mr-[22px] border-b-2 transition-colors ${
                  activeSort === sort.key
                    ? "text-[#e8e9ee] border-[#8fd19e]"
                    : "text-[#5a5c6b] border-transparent hover:text-[#8b8d9b]"
                }`}
              >
                {sort.label}
              </button>
            ))}
          </div>
        </div>

        {/* posts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onClick={onPostClick} />
          ))}
        </div>

        <button
          onClick={onLoadMore}
          className="block w-full text-center py-3.5 mt-5 bg-[#23252e] border border-[#383a46] rounded-lg text-[#8b8d9b] font-mono text-[0.82rem] hover:text-[#e8e9ee] hover:border-[#5a5c6b] transition-colors"
        >
          load more posts ↓
        </button>
      </main>
    </div>
  );
}
