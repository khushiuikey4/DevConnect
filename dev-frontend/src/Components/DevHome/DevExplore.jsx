import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchFromServer } from "../../services/search";

const LOW_LEVEL_FILTERS = [
  { key: "latest", label: "latest" },
  { key: "following", label: "following" },
  { key: "trending", label: "trending" },
];

const HIGH_LEVEL_FILTERS = [
  { key: "posts", icon: "▤", label: "Posts" },
  { key: "users", icon: "♙", label: "Users" },
];

const AVATAR_GRADIENTS = [
  "from-[#b39ddb] to-[#7eb6e0]",
  "from-[#e8a87c] to-[#8fd19e]",
  "from-[#7eb6e0] to-[#8fd19e]",
  "from-[#b39ddb] to-[#e8a87c]",
];

const GENERAL_TAGS = [
  { tag: "react", count: "1.2k posts" },
  { tag: "typescript", count: "1.4k posts" },
  { tag: "node", count: "980 posts" },
  { tag: "docker", count: "410 posts" },
];

const API_URL = "http://localhost:3000";
const avatarUrl = (src) => {
  if (!src) return "";
  if (src.startsWith("http")) return src;
  return `${API_URL}${src.startsWith("/") ? "" : "/"}${src}`;
};

const gradientFor = (name = "") =>
  AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length] ?? AVATAR_GRADIENTS[0];

const timeAgo = (date) => {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const readTime = (content = "") =>
  `${Math.max(1, Math.round(content.trim().split(/\s+/).length / 200))} min read`;

function TopicCard({ topic, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(topic.tag)}
      className="text-left bg-[#23252e] border border-[#383a46] rounded-[10px] p-4 hover:border-[#8fd19e] transition-colors cursor-pointer group"
    >
      <div className="font-mono text-[0.9rem] text-[#e8e9ee] mb-1.5 group-hover:text-[#8fd19e] transition-colors">
        #{topic.tag}
      </div>
      <div className="font-mono text-[0.74rem] text-[#5a5c6b]">
        {topic.count}
      </div>
    </button>
  );
}

function PostCard({ post, gotoProfile, onPostClick, onTagClick }) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const navigate = useNavigate();
  const postId = post._id ?? post.id;
  const author = post.author;
  const authorName = author?.username ?? (typeof author === "string" ? author : "Anonymous");
  const authorId = author?._id ?? (typeof author === "string" ? author : null);
  const authorAvatar = author?.avatar;
  const likeCount = Array.isArray(post.likes)
    ? post.likes.length
    : (post.likesCount ?? post.likes ?? 0);
  const commentCount = Array.isArray(post.comments)
    ? post.comments.length
    : (post.comments ?? 0);

  const handlePostClick = () => {
    if (onPostClick) {
      onPostClick(postId);
    } else {
      navigate(`/post/${postId}`, { state: { post } });
    }
  };

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    if (gotoProfile && authorId) {
      gotoProfile(authorId);
    }
  };

  return (
    <div
      onClick={handlePostClick}
      className="bg-[#23252e] border border-[#383a46] rounded-[10px] p-[22px] cursor-pointer hover:border-[#4a4d5c] transition-colors flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center gap-2.5 text-[0.78rem] text-[#5a5c6b] mb-3">
          {authorAvatar && !avatarFailed ? (
            <img
              src={avatarUrl(authorAvatar)}
              alt={authorName}
              onError={() => setAvatarFailed(true)}
              onClick={handleAuthorClick}
              className="w-7 h-7 rounded-full object-cover hover:opacity-80 transition-opacity"
            />
          ) : (
            <div
              onClick={handleAuthorClick}
              className={`w-7 h-7 rounded-full bg-gradient-to-br ${gradientFor(
                authorName
              )} flex items-center justify-center text-[#1e1f26] text-xs font-bold hover:opacity-80 transition-opacity`}
            >
              {authorName[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <span
            onClick={handleAuthorClick}
            className="hover:text-[#8fd19e] transition-colors"
          >
            {authorName}
          </span>
          {post.createdAt && <span>· {timeAgo(post.createdAt)}</span>}
          {post.content && <span>· {readTime(post.content)}</span>}
        </div>

        <h3 className="text-[1rem] font-semibold mb-2 leading-[1.35] text-[#e8e9ee] hover:text-[#8fd19e] transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-[#8b8d9b] text-[0.85rem] leading-[1.55] mb-3.5 line-clamp-3">
            {post.excerpt}
          </p>
        )}
      </div>

      <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#383a46]/50">
        <div className="flex gap-1.5 flex-wrap">
          {post.tags?.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTagClick?.(tag);
              }}
              className="font-mono text-[0.7rem] text-[#8fd19e] bg-[#8fd19e1a] hover:bg-[#8fd19e33] px-2 py-[3px] rounded transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
        <div className="font-mono text-[0.72rem] text-[#5a5c6b] flex gap-2.5 shrink-0 ml-2">
          <span>♥ {likeCount}</span>
          <span>· 💬 {commentCount}</span>
        </div>
      </div>
    </div>
  );
}

function UserCard({ user, gotoProfile, onUserClick }) {
  const [failed, setFailed] = useState(false);
  const authorName = user.username || user.name || "Developer";
  const authorAvatar = user.avatar;
  const userId = user._id || user.id;

  const handleClick = () => {
    if (gotoProfile && userId) {
      gotoProfile(userId);
    } else if (onUserClick && userId) {
      onUserClick(userId);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-[#23252e] border border-[#383a46] rounded-[10px] p-[18px_20px] hover:border-[#4a4d5c] transition-colors">
      {authorAvatar && !failed ? (
        <img
          src={avatarUrl(authorAvatar)}
          alt={authorName}
          onError={() => setFailed(true)}
          onClick={handleClick}
          className="w-12 h-12 rounded-full object-cover shrink-0 cursor-pointer"
        />
      ) : (
        <div
          onClick={handleClick}
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradientFor(
            authorName
          )} flex items-center justify-center text-[#1e1f26] font-semibold shrink-0 cursor-pointer`}
        >
          {authorName[0]?.toUpperCase() ?? "?"}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3
          onClick={handleClick}
          className="text-[1rem] font-semibold cursor-pointer hover:text-[#8fd19e] transition-colors truncate"
        >
          {authorName}
        </h3>
        {user.bio ? (
          <p className="text-[#8b8d9b] text-[0.85rem] leading-[1.5] mt-0.5 line-clamp-2">
            {user.bio}
          </p>
        ) : (
          <p className="text-[#5a5c6b] text-[0.8rem] italic mt-0.5">No bio yet</p>
        )}
        <div className="flex gap-3 mt-1.5 flex-wrap font-mono text-[0.72rem] text-[#5a5c6b]">
          {user.location && <span>📍 {user.location}</span>}
          {user.followerCount !== undefined && (
            <span>{user.followerCount} followers</span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleClick}
        className="font-mono text-[0.78rem] px-3.5 py-1.5 rounded-md border border-[#8fd19e] text-[#8fd19e] hover:bg-[#8fd19e] hover:text-[#182019] transition-colors shrink-0 cursor-pointer"
      >
        view profile
      </button>
    </div>
  );
}

export default function DevExplore({
  topics = GENERAL_TAGS,
  gotoProfile,
  onPostClick,
  onUserClick,
}) {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [activeType, setActiveType] = useState("posts"); // "posts" | "users"
  const [activeSort, setActiveSort] = useState("latest"); // "latest" | "following" | "trending"
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Core data fetch function
  const fetchData = async ({
    q = activeQuery,
    type = activeType,
    sort = activeSort,
    cursor = null,
    isLoadMore = false,
  }) => {
    // In Explore, users should only be visible when searched
    if (type === "users" && !q.trim()) {
      setUsers([]);
      setActiveQuery(q);
      setActiveType(type);
      setActiveSort(sort);
      setNextCursor(null);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const results = await searchFromServer(q, cursor, sort, type);

      if (results) {
        const fetchedPosts = Array.isArray(results.posts) ? results.posts : [];
        const fetchedUsers = Array.isArray(results.users) ? results.users : [];

        if (isLoadMore) {
          if (type === "posts") {
            setPosts((prev) => [...prev, ...fetchedPosts]);
          } else {
            setUsers((prev) => [...prev, ...fetchedUsers]);
          }
        } else {
          setPosts(fetchedPosts);
          setUsers(fetchedUsers);
          setActiveQuery(q);
          setActiveType(type);
          setActiveSort(sort);
        }

        setNextCursor(results.nextCursor || null);
      }
    } catch (err) {
      console.error("Failed to load explore data:", err);
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Initial load
  useEffect(() => {
    fetchData({ q: "", type: "posts", sort: "latest", cursor: null, isLoadMore: false });
  }, []);

  // Handle Search button / Enter
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    fetchData({
      q: query.trim(),
      type: activeType,
      sort: activeSort,
      cursor: null,
      isLoadMore: false,
    });
  };

  // Handle General Tag Click: automatically treats it as search query
  const handleTagClick = (tag) => {
    setQuery(tag);
    fetchData({
      q: tag,
      type: activeType,
      sort: activeSort,
      cursor: null,
      isLoadMore: false,
    });
  };

  // Clear search query
  const handleClear = () => {
    setQuery("");
    if (activeType === "users") {
      setUsers([]);
      setActiveQuery("");
      setNextCursor(null);
    } else {
      fetchData({
        q: "",
        type: activeType,
        sort: activeSort,
        cursor: null,
        isLoadMore: false,
      });
    }
  };

  // Handle Top-level Filter Change (posts vs users)
  const handleTypeChange = (type) => {
    if (type === activeType) return;
    setActiveType(type);
    if (type === "users" && !activeQuery.trim()) {
      setUsers([]);
      setNextCursor(null);
      return;
    }
    fetchData({
      q: activeQuery,
      type,
      sort: activeSort,
      cursor: null,
      isLoadMore: false,
    });
  };

  // Handle Low-level Filter Change (latest, following, trending)
  const handleSortChange = (sort) => {
    if (sort === activeSort) return;
    setActiveSort(sort);
    fetchData({
      q: activeQuery,
      type: activeType,
      sort,
      cursor: null,
      isLoadMore: false,
    });
  };

  // Handle Load More pagination
  const handleLoadMore = () => {
    if (loadingMore || !nextCursor) return;
    fetchData({
      q: activeQuery,
      type: activeType,
      sort: activeSort,
      cursor: nextCursor,
      isLoadMore: true,
    });
  };

  const currentItemsCount = activeType === "posts" ? posts.length : users.length;

  return (
    <div className="min-h-screen bg-[#1e1f26] text-[#e8e9ee]">
      <main className="max-w-[1080px] mx-auto px-7 py-9 pb-20">
        <div className="font-mono text-[0.82rem] text-[#5a5c6b] mb-1.5">
          // <span className="text-[#8fd19e]">discover</span> what developers are building
        </div>
        <h1 className="text-[1.7rem] font-semibold mb-6 tracking-[-0.01em]">
          Explore
        </h1>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2.5 bg-[#23252e] border border-[#383a46] rounded-lg px-4.5 py-3 mb-6"
        >
          <span className="text-[#5a5c6b] text-[1.1rem]">⌕</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search all posts, tags, or authors..."
            className="flex-1 bg-transparent border-none outline-none text-[#e8e9ee] font-mono text-[0.9rem] placeholder:text-[#5a5c6b]"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[#5a5c6b] hover:text-[#e8e9ee] font-mono text-sm px-1.5 cursor-pointer"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            className="bg-[#8fd19e] hover:bg-[#a3dfb0] text-[#1e1f26] font-mono text-[0.82rem] font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* General Tags / Topics */}
        <div className="font-mono text-[0.78rem] text-[#8fd19e] mb-3">
          // browse by topic
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {topics.map((topic) => (
            <TopicCard
              key={topic.tag}
              topic={topic}
              onClick={handleTagClick}
            />
          ))}
        </div>

        {/* Filter Controls Row: High-level (posts vs users) and Low-level (latest, following, trending) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-2 border-b border-[#383a46]">
          {/* High-level type filter: posts & users */}
          <div className="flex gap-2">
            {HIGH_LEVEL_FILTERS.map((f) => {
              const isActive = activeType === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => handleTypeChange(f.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-[0.82rem] transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#8fd19e] text-[#182019] font-semibold border border-[#8fd19e]"
                      : "bg-[#23252e] text-[#8b8d9b] border border-[#383a46] hover:text-[#e8e9ee] hover:border-[#5a5c6b]"
                  }`}
                >
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Low-level sort filter: latest, following, trending */}
          <div className="flex items-center">
            {LOW_LEVEL_FILTERS.map((sort) => {
              const isActive = activeSort === sort.key;
              return (
                <button
                  key={sort.key}
                  type="button"
                  onClick={() => handleSortChange(sort.key)}
                  className={`font-mono text-[0.82rem] py-2 px-3 border-b-2 transition-colors cursor-pointer ${
                    isActive
                      ? "text-[#e8e9ee] border-[#8fd19e] font-semibold"
                      : "text-[#5a5c6b] border-transparent hover:text-[#8b8d9b]"
                  }`}
                >
                  {sort.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search feedback / Status banner */}
        {activeQuery && (
          <div className="mb-5 flex items-center justify-between font-mono text-[0.82rem] text-[#8b8d9b] bg-[#23252e]/60 px-4 py-2.5 rounded-md border border-[#383a46]/50">
            <span>
              Showing results for:{" "}
              <span className="text-[#8fd19e] font-semibold">"{activeQuery}"</span> in{" "}
              <span className="text-[#e8e9ee] font-semibold">{activeType}</span> ({activeSort})
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-[#8fd19e] hover:underline cursor-pointer ml-3"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Main Content Area */}
        {loading ? (
          <div className="py-16 text-center font-mono text-[0.85rem] text-[#8b8d9b]">
            // fetching {activeType}...
          </div>
        ) : (
          <>
            {activeType === "posts" && (
              <>
                {posts.length === 0 ? (
                  <div className="py-16 text-center bg-[#23252e]/30 rounded-lg border border-[#383a46]/40">
                    <p className="font-mono text-[0.88rem] text-[#8b8d9b] mb-1">
                      // no posts found
                    </p>
                    <p className="text-[0.8rem] text-[#5a5c6b]">
                      Try a different search query or select another filter tab.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {posts.map((post) => (
                      <PostCard
                        key={post._id ?? post.id}
                        post={post}
                        gotoProfile={gotoProfile}
                        onPostClick={onPostClick}
                        onTagClick={handleTagClick}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeType === "users" && (
              <>
                {!activeQuery.trim() ? (
                  <div className="py-16 text-center bg-[#23252e]/30 rounded-lg border border-[#383a46]/40">
                    <p className="font-mono text-[0.88rem] text-[#8fd19e] mb-2">
                      // search developers
                    </p>
                    <p className="text-[0.82rem] text-[#8b8d9b]">
                      Type a username or keyword in the search bar above to discover developers.
                    </p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="py-16 text-center bg-[#23252e]/30 rounded-lg border border-[#383a46]/40">
                    <p className="font-mono text-[0.88rem] text-[#8b8d9b] mb-1">
                      // no developers found
                    </p>
                    <p className="text-[0.8rem] text-[#5a5c6b]">
                      Try a different search query or select another filter tab.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {users.map((user) => (
                      <UserCard
                        key={user._id ?? user.id}
                        user={user}
                        gotoProfile={gotoProfile}
                        onUserClick={onUserClick}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Pagination: Load More Button */}
        {!loading && nextCursor && (
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="block w-full text-center py-3.5 mt-6 bg-[#23252e] border border-[#383a46] rounded-lg text-[#8fd19e] font-mono text-[0.85rem] font-semibold hover:border-[#8fd19e] hover:bg-[#23252e]/80 transition-colors cursor-pointer disabled:opacity-50"
          >
            {loadingMore ? "Loading more..." : `Load more ${activeType} ↓`}
          </button>
        )}

        {!loading && !nextCursor && currentItemsCount > 0 && (
          <div className="text-center py-6 font-mono text-[0.76rem] text-[#5a5c6b]">
            // end of {activeType}
          </div>
        )}
      </main>
    </div>
  );
}
