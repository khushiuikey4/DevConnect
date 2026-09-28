/**
 * DevConnect — Landing Explore
 * The public feed preview section on the landing page, styled
 * like a `git log` output. Anchors to #log so the header's
 * "explore.js" nav link scrolls here.
 *
 * Usage:
 *   import LandingExplore from "./LandingExplore";
 *   <LandingExplore posts={posts} onPostClick={...} />
 *
 * `posts` defaults to sample data below if not provided — pass
 * real posts fetched from your API once that's wired up.
 */

const TAG_COLORS = {
  g: "text-[#8fd19e] bg-[#8fd19e1a]",
  p: "text-[#b39ddb] bg-[#b39ddb1a]",
  o: "text-[#e8a87c] bg-[#e8a87c1a]",
};

const SAMPLE_POSTS = [
  {
    id: "a3f9c1",
    title: "Connecting React to Express without losing my mind",
    excerpt:
      "Everything I wish someone had told me about CORS, proxies, and state before my first full-stack project.",
    tags: [
      { label: "react", color: "g" },
      { label: "express", color: "p" },
    ],
  },
  {
    id: "7b21de",
    title: "JWT auth from scratch: the parts tutorials skip",
    excerpt:
      "Refresh tokens, httpOnly cookies, and the one authorization check that actually matters.",
    tags: [
      { label: "nodejs", color: "o" },
      { label: "auth", color: "p" },
    ],
  },
  {
    id: "4e08a7",
    title: "Why I moved my state into Redux Toolkit",
    excerpt:
      "A small project didn't need it. This one did. Here's the exact moment I felt the difference.",
    tags: [
      { label: "redux", color: "g" },
      { label: "react", color: "g" },
    ],
  },
];

function LogRow({ post, onClick }) {
  return (
    <div
      onClick={() => onClick?.(post)}
      className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] gap-4 sm:gap-5 p-5 sm:p-[22px] border-b border-[#383a46] last:border-b-0 items-start cursor-pointer hover:bg-[#2a2c37] transition-colors"
    >
      <div className="font-mono text-[0.78rem] text-[#5a5c6b] pt-0.5">
        {post.id}
      </div>
      <div className="min-w-0">
        <h3 className="text-[1rem] font-medium mb-2 text-[#e8e9ee]">
          {post.title}
        </h3>
        <p className="text-[#8b8d9b] text-[0.85rem] leading-[1.55] m-0">
          {post.excerpt}
        </p>
      </div>
      <div className="flex gap-2 flex-wrap content-start sm:justify-self-end">
        {post.tags.map((tag) => (
          <span
            key={tag.label}
            className={`font-mono text-[0.72rem] px-2.5 py-[3px] rounded ${TAG_COLORS[tag.color]}`}
          >
            {tag.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function LandingExplore({ posts = SAMPLE_POSTS, onPostClick }) {
  return (
    <section id="explore" className="scroll-mt-32 bg-[#1e1f26] text-[#e8e9ee] py-20">
      <div className="max-w-[1080px] mx-auto px-7">
        <div className="max-w-[560px] mb-12">
          <div className="font-mono text-[0.78rem] text-[#8fd19e] mb-3.5">
            $ git log --feed
          </div>
          <h2 className="text-[1.6rem] sm:text-[2.1rem] font-medium tracking-[-0.01em] m-0">
            What people are shipping
          </h2>
        </div>

        <div className="border border-[#383a46] rounded-lg overflow-hidden">
          {posts.map((post) => (
            <LogRow key={post.id} post={post} onClick={onPostClick} />
          ))}
        </div>
      </div>
    </section>
  );
}
