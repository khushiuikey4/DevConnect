
import { useState, useMemo, useEffect } from "react";
import { getSavedPostsFromServer } from "../../services/savedPosts";

/**
 * DevConnect — Dev Saved (saved.js)
 * Fetches saved posts from the backend when the component mounts.
 * Keeps tag filtering on the frontend.
 */

const AVATAR_GRADIENTS = [
  "from-[#b39ddb] to-[#7eb6e0]",
  "from-[#e8a87c] to-[#8fd19e]",
  "from-[#7eb6e0] to-[#8fd19e]",
];

function SavedRow({ post, onUnsave, onPostClick }) {
  const postId = post._id || post.id;
  const authorName =
    typeof post.author === "object"
      ? post.author?.username || "Unknown author"
      : post.author || "Unknown author";

  const avatarUrl =
    typeof post.author === "object" ? post.author?.avatar : null;

  const tags = Array.isArray(post.tags) ? post.tags : [];

  const excerpt =
    post.excerpt ||
    (post.content ? post.content.slice(0, 160) : "");

  const savedAgo = post.savedAgo || "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4.5 items-start bg-[#23252e] border border-[#383a46] rounded-[10px] p-5 mb-3">
      <div>
        <div className="flex items-center gap-2.5 text-[0.8rem] text-[#5a5c6b] mb-2.5">
          {avatarUrl ? (
            <img
              src={
                avatarUrl.startsWith("http")
                  ? avatarUrl
                  : `http://localhost:3000/${avatarUrl.replace(/^\/+/, "")}`
              }
              alt={authorName}
              className="w-5 h-5 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span
              className={`w-5 h-5 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[
                (authorName.length || 0) % AVATAR_GRADIENTS.length
              ]
                }`}
            />
          )}

          <span>{authorName}</span>
        </div >

        <h3
          onClick={() => onPostClick?.(postId)}
          className="text-[1.02rem] font-semibold mb-2 cursor-pointer hover:text-[#8fd19e] transition-colors"
        >
          {post.title}
        </h3>

        <p className="text-[#8b8d9b] text-[0.86rem] leading-[1.55] mb-3">
          {excerpt}
        </p>

        <div className="flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex gap-2 flex-wrap">
            {tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[0.72rem] text-[#8fd19e] bg-[#8fd19e1a] px-2.5 py-[3px] rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          <span className="font-mono text-[0.74rem] text-[#5a5c6b]">
            {savedAgo}
          </span>
        </div>
      </div >

      <div>
        <button
          onClick={() => onUnsave?.(postId)}
          className="font-mono text-[0.76rem] px-3.5 py-1.5 rounded-md border border-[#383a46] text-[#e8a87c] bg-[#e8a87c14] hover:border-[#e8a87c] transition-colors whitespace-nowrap"
        >
          🔖 unsave
        </button>
      </div>
    </div >
  );
}

export default function DevSaved({ onUnsave, onPostClick }) {
  const [posts, setPosts] = useState([]);
  const [activeTag, setActiveTag] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getSavedPostsFromServer();

        setPosts(result.posts || []);
      } catch (error) {
        console.error("Failed to fetch saved posts:", error);
        setError(error.message || "Failed to fetch saved posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, []);

  const tags = useMemo(() => {
    const unique = new Set();

    posts.forEach((post) => {
      (Array.isArray(post.tags) ? post.tags : []).forEach((tag) =>
        unique.add(tag)
      );
    });

    return Array.from(unique);
  }, [posts]);

  const filteredPosts = useMemo(
    () =>
      activeTag === "all"
        ? posts
        : posts.filter(
          (post) =>
            Array.isArray(post.tags) && post.tags.includes(activeTag)
        ),
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

        {loading ? (
          <div className="text-center py-16 px-5 text-[#8b8d9b]">
            Loading saved posts...
          </div>
        ) : error ? (
          <div className="text-center py-16 px-5 border border-dashed border-[#383a46] rounded-[10px]">
            <div className="font-mono text-[0.9rem] text-[#e8a87c] mb-2.5">
              // failed to load posts
            </div>
            <p className="text-[0.9rem] text-[#8b8d9b]">{error}</p>
          </div>
        ) : (
          <>
            {tags.length > 0 && (
              <div className="flex gap-2.5 mb-6 flex-wrap">
                <button
                  onClick={() => setActiveTag("all")}
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
                    onClick={() => setActiveTag(tag)}
                    className={`font-mono text-[0.78rem] px-3.5 py-1.5 rounded-full border transition-colors ${activeTag === tag
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
                  key={post._id || post.id}
                  post={post}
                  onUnsave={onUnsave}
                  onPostClick={onPostClick}
                />
              ))
            )}
          </>
        )}
      </main>
    </div>
  );
}
