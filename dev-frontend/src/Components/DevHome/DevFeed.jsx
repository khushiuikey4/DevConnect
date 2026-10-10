import { useEffect, useState } from "react";
import DevSidebar from "./DevSidebar";
import { searchFromServer, fetchLPostsFromServer, fetchUPostsFromServer } from "../../services/search";

/**
 * DevConnect — Dev Feed (feed.js)
 *
 * Data flow (matches your backend):
 *   1. Page load/Search  -> GET  /search?q=...            -> { posts, users }   (searchList; empty q = recent posts only)
 *   2. Sort tabs         -> POST /search { list, filter } -> upList   (all | following | latest | trending)
 *   3. Keyword chips     -> POST /search { list, filter } -> lowList  (keyword filter on upList)
 *   4. Posts / People    -> only decides which half of lowList is shown
 *
 * Usage:
 *   <DevContainer activeTab="feed" user={user}>
 *     <DevFeed currentUserId={user?._id} />
 *   </DevContainer>
 *
 * Optional props: tags, currentUserId, onSearch, onSortChange, onFilterChange,
 * onLike, onSave, onPostClick, onUserClick, onFollow, onTagClick, onLoadMore
 */

const SORTS = [
  { key: "all", label: "all" },
  { key: "following", label: "following" },
  { key: "latest", label: "latest" },
  { key: "trending", label: "trending" },
];

const AVATAR_GRADIENTS = [
  "from-[#b39ddb] to-[#7eb6e0]",
  "from-[#e8a87c] to-[#8fd19e]",
  "from-[#7eb6e0] to-[#8fd19e]",
];

// always a valid shape, so .map / .length never hit undefined
const EMPTY = { posts: [], users: [] };
const normalize = (data) => ({
  posts: Array.isArray(data?.posts) ? data.posts : [],
  users: Array.isArray(data?.users) ? data.users : [],
});

/* ------------------------------ helpers ------------------------------ */

const timeAgo = (date) => {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const readTime = (content = "") =>
  `${Math.max(1, Math.round(content.trim().split(/\s+/).length / 200))} min read`;

const gradientFor = (name = "") =>
  AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length] ?? AVATAR_GRADIENTS[0];

function Avatar({ src, name = "", large = false }) {
  const size = large ? "w-12 h-12 text-base" : "w-[22px] h-[22px]";
  if (src) {
    return <img src={src} alt={name} className={`${size} rounded-full object-cover shrink-0`} />;
  }
  return (
    <span
      className={`${size} rounded-full bg-gradient-to-br ${gradientFor(name)} flex items-center justify-center text-[#1e1f26] font-semibold shrink-0`}
    >
      {large ? name[0]?.toUpperCase() ?? "?" : ""}
    </span>
  );
}

/* ------------------------------ cards ------------------------------ */

function PostCard({ post, currentUserId, onLike, onSave, onClick }) {
  const authorName = post.author?.username ?? "unknown";
  const authorAvatar = post.author?.avatar ?? post.author?.profilePicture;
  const likes = Array.isArray(post.likes) ? post.likes : [];
  const savedBy = Array.isArray(post.savedBy) ? post.savedBy : [];
  const liked = !!currentUserId && likes.includes(currentUserId);
  const saved = !!currentUserId && savedBy.includes(currentUserId);
  const excerpt = post.excerpt || post.content?.slice(0, 160) || "";

  return (
    <div className="bg-[#23252e] border border-[#383a46] rounded-[10px] p-[22px_24px] mb-4">
      <div className="flex items-center gap-2.5 text-[0.8rem] text-[#5a5c6b] mb-3.5">
        <Avatar src={authorAvatar} name={authorName} />
        <span>{authorName}</span>
        <span>· {readTime(post.content)} · {timeAgo(post.createdAt)}</span>
      </div>

      <h3
        onClick={() => onClick?.(post._id)}
        className="text-[1.08rem] font-semibold mb-2 cursor-pointer hover:text-[#8fd19e] transition-colors"
      >
        {post.title}
      </h3>
      <p className="text-[#8b8d9b] text-[0.88rem] leading-[1.6] mb-4">{excerpt}</p>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {(post.tags ?? []).map((tag) => (
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
            onClick={() => onLike?.(post._id)}
            className={`font-mono text-[0.78rem] flex items-center gap-1.5 ${liked ? "text-[#e18a8a]" : "text-[#5a5c6b] hover:text-[#e8e9ee]"
              }`}
          >
            {liked ? "♥" : "♡"} {likes.length}
          </button>
          <button
            onClick={() => onClick?.(post._id)}
            className="font-mono text-[0.78rem] text-[#5a5c6b] hover:text-[#e8e9ee] flex items-center gap-1.5"
          >
            💬 {post.commentCount ?? 0}
          </button>
          <button
            onClick={() => onSave?.(post._id)}
            className={`font-mono text-[0.78rem] ${saved ? "text-[#e8a87c]" : "text-[#5a5c6b] hover:text-[#e8e9ee]"
              }`}
          >
            {saved ? "🔖 saved" : "🔖 save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserCard({ user, onFollow, onClick }) {
  return (
    <div className="bg-[#23252e] border border-[#383a46] rounded-[10px] p-[18px_22px] mb-4 flex items-center gap-4">
      <Avatar src={user.avatar} name={user.username} large />

      <div className="flex-1 min-w-0">
        <h3
          onClick={() => onClick?.(user._id)}
          className="text-[1rem] font-semibold cursor-pointer hover:text-[#8fd19e] transition-colors truncate"
        >
          {user.username}
        </h3>
        {user.bio && (
          <p className="text-[#8b8d9b] text-[0.85rem] leading-[1.5] mt-0.5 line-clamp-2">{user.bio}</p>
        )}
        {(user.location || user.followerCount !== undefined) && (
          <div className="flex gap-3 mt-1.5 flex-wrap font-mono text-[0.72rem] text-[#5a5c6b]">
            {user.location && <span>📍 {user.location}</span>}
            {user.followerCount !== undefined && <span>{user.followerCount} followers</span>}
          </div>
        )}
      </div>

      <button
        onClick={() => onFollow?.(user._id)}
        className="font-mono text-[0.78rem] px-4 py-1.5 rounded-md border border-[#8fd19e] text-[#8fd19e] hover:bg-[#8fd19e] hover:text-[#182019] transition-colors shrink-0"
      >
        follow
      </button>
    </div>
  );
}

/* ------------------------------ feed ------------------------------ */

export default function DevFeed({
  tags = ["react", "nodejs", "mongodb", "typescript"],
  currentUserId,
  onSearch,
  onSortChange,
  onFilterChange,
  onLike,
  onSave,
  onPostClick,
  onUserClick,
  onLoadMore,
  onFollow,
  onTagClick,
}) {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("posts"); // "posts" | "people"

  const [upFilter, setUpFilter] = useState("all");
  const [lowFilter, setLowFilter] = useState("all");

  const [searchList, setSearchList] = useState(EMPTY);
  const [upList, setUpList] = useState(EMPTY);
  const [lowList, setLowList] = useState(EMPTY);
  const [searching, setSearching] = useState(true);

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const runSearch = () => setSearchQuery(query.trim());

  // 1) text search -> GET /search?q=   (an empty q returns the recent posts/people)
  useEffect(() => {
    let cancelled = false;

    const fetchPostOnSearch = async () => {
      setSearching(true);
      const sList = await searchFromServer(searchQuery); // undefined if the request failed
      if (cancelled) return;
      setSearchList(normalize(sList));
      setUpFilter("all");
      setLowFilter("all");
      setSearching(false);
    };

    fetchPostOnSearch();
    return () => { cancelled = true; };
  }, [searchQuery]);

  // 2) upper filter (all | following | latest | trending) -> POST /search
  useEffect(() => {
    let cancelled = false;

    const fetchPostOnUFilter = async () => {
      if (searchList.posts.length === 0 && searchList.users.length === 0) {
        setUpList(EMPTY);
        return;
      }
      const uList = await fetchUPostsFromServer(searchList, upFilter, category);
      if (cancelled) return;
      setLowFilter("all");
      setUpList(normalize(uList));
    };

    fetchPostOnUFilter();
    return () => { cancelled = true; };
  }, [searchList, upFilter, category]);

  // 3) lower filter (keyword chips) -> POST /search
  useEffect(() => {
    let cancelled = false;

    const fetchPostOnLFilter = async () => {
      if (lowFilter === "all") {
        setLowList(upList); // nothing to filter, no request needed
        return;
      }
      const lList = await fetchLPostsFromServer(upList, lowFilter, category);
      if (cancelled) return;
      setLowList(normalize(lList));
    };

    fetchPostOnLFilter();
    return () => { cancelled = true; };
  }, [lowFilter, upList, category]);

  const posts = lowList.posts;
  const users = searchQuery ? lowList.users : []; // people only after a search
  const items = category === "posts" ? posts : users;

  const changeCategory = (next) => {
    setCategory(next);
    setLowFilter("all"); // keyword chips only apply to posts
  };

  const categoryBtn = (key, icon, label, count) => (
    <button
      type="button"
      onClick={() => changeCategory(key)}
      className={
        category === key
          ? "flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8fd19e] text-[#182019] font-mono text-[0.82rem] font-semibold border border-[#8fd19e] transition-colors"
          : "flex items-center gap-2 px-4 py-2 rounded-lg bg-[#23252e] text-[#8b8d9b] font-mono text-[0.82rem] border border-[#383a46] hover:text-[#e8e9ee] hover:border-[#5a5c6b] transition-colors"
      }
    >
      <span>{icon}</span>
      {label}
      {(key === "posts" || searchQuery) && <span className="opacity-70">{count}</span>}
    </button>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-10 items-start">
      {/* main feed column */}
      <div>
        <div className="font-mono text-[0.82rem] text-[#5a5c6b] mb-1.5">
          // <span className="text-[#8fd19e]">welcome back </span>
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
            onKeyDown={(e) => {
              if (e.key === "Enter") runSearch();
            }}
          />
          <button
            type="button"
            className="bg-[#8fd19e] hover:bg-[#a3dfb0] text-[#1e1f26] font-mono text-[0.8rem] font-semibold px-4 py-2 rounded-md transition-colors"
            onClick={runSearch}
          >
            Search
          </button>
        </div>

        {/* search result type */}
        <div className="flex gap-2 mb-5">
          {categoryBtn("posts", "▤", "Posts", posts.length)}
          {categoryBtn("people", "♙", "People", users.length)}
        </div>

        {/* sort tabs */}
        <div className="flex gap-0 mb-4 border-b border-[#383a46]">
          {SORTS.map((sort) => (
            <button
              key={sort.key}
              onClick={() => {
                onSortChange?.(sort.key);
                setUpFilter(sort.key);
              }}
              className={`font-mono text-[0.8rem] py-2 mr-[22px] border-b-2 transition-colors ${upFilter === sort.key
                ? "text-[#e8e9ee] border-[#8fd19e]"
                : "text-[#5a5c6b] border-transparent hover:text-[#8b8d9b]"
                }`}
            >
              {sort.label}
            </button>
          ))}
        </div>

        {/* keyword chips (posts only) */}
        {category === "posts" && (
          <div className="flex gap-2.5 mb-6 flex-wrap">
            {["all", ...tags].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  onFilterChange?.(tag);
                  setLowFilter(tag);
                }}
                className={`font-mono text-[0.78rem] px-3.5 py-1.5 rounded-full border transition-colors ${lowFilter === tag
                  ? "bg-[#8fd19e] text-[#182019] border-[#8fd19e] font-semibold"
                  : "border-[#383a46] text-[#8b8d9b] hover:text-[#e8e9ee]"
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* status messages */}
        {searching && (
          <p className="font-mono text-[0.85rem] text-[#5a5c6b] py-8 text-center">// searching...</p>
        )}
        {category === "people" && !searchQuery && (
          <p className="font-mono text-[0.85rem] text-[#5a5c6b] py-8 text-center">
            // search above to find people
          </p>
        )}
        {!searching && items.length === 0 && !(category === "people" && !searchQuery) && (
          <p className="font-mono text-[0.85rem] text-[#5a5c6b] py-8 text-center">
            // no {category === "posts" ? "posts" : "people"} found
          </p>
        )}

        {/* results: conditional on category */}
        {category === "posts"
          ? posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={currentUserId}
              onLike={onLike}
              onSave={onSave}
              onClick={onPostClick}
            />
          ))
          : users.map((user) => (
            <UserCard key={user._id} user={user} onFollow={onFollow} onClick={onUserClick} />
          ))}

        {onLoadMore && items.length > 0 && (
          <button
            onClick={onLoadMore}
            className="block w-full text-center py-3.5 mt-1 bg-[#23252e] border border-[#383a46] rounded-lg text-[#8b8d9b] font-mono text-[0.82rem] hover:text-[#e8e9ee] hover:border-[#5a5c6b] transition-colors"
          >
            load more {category === "posts" ? "posts" : "people"} ↓
          </button>
        )}
      </div>

      {/* sidebar column */}
      <DevSidebar onFollow={onFollow} onTagClick={onTagClick} />
    </div>
  );
}