
import { useState, useMemo, useEffect } from "react";
import { getMyPostsFromServer } from "../../services/myPosts";

const FILTERS = [
  { key: "all", label: "all" },
  { key: "published", label: "published" },
  { key: "draft", label: "drafts" },
];

function PostRow({ post, onEdit, onDelete, onContinueWriting }) {
  const isDraft = post.status === "draft";

  const postId = post._id || post.id;
  const authorName = post.author?.username || "Unknown author";
  const authorAvatar = post.author?.avatar;

  const postDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    : post.date || "";

  const excerpt =
    post.excerpt?.trim() ||
    (post.content ? post.content.slice(0, 160) : "");

  const tags = post.tags || [];

  const likes = Array.isArray(post.likes)
    ? post.likes.length
    : post.likes || 0;

  const avatarUrl = authorAvatar
    ? authorAvatar.startsWith("http")
      ? authorAvatar
      : `http://localhost:3000${authorAvatar.startsWith("/") ? "" : "/"
      }${authorAvatar}`
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5 items-start bg-[#23252e] border border-[#383a46] rounded-[10px] p-[22px_24px] mb-3.5">
      <div>
        <div className="flex items-center gap-2.5 mb-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={authorName}
              className="w-8 h-8 rounded-full object-cover border border-[#383a46]"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#383a46] flex items-center justify-center text-[#8fd19e] font-semibold">
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}

          <span className="text-sm text-[#e8e9ee] font-medium">
            {authorName}
          </span>
        </div>

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
            {isDraft ? "last edited " : ""}
            {postDate}
          </span>
        </div>

        <h3 className="text-[1.05rem] font-semibold mb-2 text-[#e8e9ee]">
          {post.title}
        </h3>

        <p className="text-[#8b8d9b] text-[0.87rem] leading-[1.55] mb-3.5">
          {excerpt}
        </p>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2 flex-wrap">
            {tags.map((tag) => (
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
              <span>♥ {likes}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-row md:flex-col gap-2">
        <button
          onClick={() =>
            isDraft
              ? onContinueWriting?.(postId)
              : onEdit?.(postId)
          }
          className="flex-1 md:flex-none font-mono text-[0.76rem] px-3.5 py-1.5 rounded-md border border-[#383a46] text-[#8b8d9b] hover:text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors whitespace-nowrap"
        >
          {isDraft ? "continue writing" : "edit"}
        </button>

        <button
          onClick={() => onDelete?.(postId)}
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
  onEdit,
  onDelete,
  onContinueWriting,
}) {
  const [filter, setFilter] = useState("all");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const result = await getMyPostsFromServer();
        console.log("My posts API response:", result);
        setPosts(result.posts || []);
      } catch (error) {
        console.error("Failed to fetch my posts:", error);
      }
    };

    fetchMyPosts();
  }, []);

  const counts = useMemo(
    () => ({
      all: posts.length,
      published: posts.filter(
        (post) => post.status === "published"
      ).length,
      draft: posts.filter(
        (post) => post.status === "draft"
      ).length,
    }),
    [posts]
  );

  const totalLikes = useMemo(
    () =>
      posts.reduce(
        (sum, post) =>
          sum +
          (Array.isArray(post.likes)
            ? post.likes.length
            : post.likes || 0),
        0
      ),
    [posts]
  );

  const filteredPosts = useMemo(
    () =>
      filter === "all"
        ? posts
        : posts.filter((post) => post.status === filter),
    [posts, filter]
  );

  return (
    <div className="min-h-screen bg-[#1e1f26] text-[#e8e9ee]">
      <main className="max-w-[1080px] mx-auto px-7 py-9 pb-20">
        <div className="font-mono text-[0.82rem] text-[#5a5c6b] mb-1.5">
          // <span className="text-[#8fd19e]">
            your published work
          </span>
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
              <b className="text-[#8fd19e] font-semibold">
                {counts.draft}
              </b>{" "}
              draft{counts.draft !== 1 ? "s" : ""}
            </span>

            <span>
              <b className="text-[#8fd19e] font-semibold">
                {totalLikes}
              </b>{" "}
              total likes
            </span>
          </div>
        </div>

        <div className="flex gap-0 mb-6 border-b border-[#383a46]">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`font-mono text-[0.8rem] py-2 mr-[22px] border-b-2 transition-colors ${filter === item.key
                ? "text-[#e8e9ee] border-[#8fd19e]"
                : "text-[#5a5c6b] border-transparent hover:text-[#8b8d9b]"
                }`}
            >
              {item.label}{" "}
              <span className="text-[0.74rem] text-[#5a5c6b]">
                ({counts[item.key]})
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
                : filter === "published"
                  ? "No published posts yet."
                  : "You haven't created any posts yet."}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostRow
              key={post._id || post.id}
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
