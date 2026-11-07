import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { getMyPostsFromServer } from "../../services/myPosts";
import { searchOwnFromServer } from "../../services/search";
import { deleteMyPostFromServer } from "../../services/myPosts";

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
  const [deleteBox, setDeleteBox] = useState(false);
  const navigate = useNavigate();

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
            navigate(`/my-posts/edit/${post._id}`)
          }
          className="flex-1 md:flex-none font-mono text-[0.76rem] px-3.5 py-1.5 rounded-md border border-[#383a46] text-[#8b8d9b] hover:text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors whitespace-nowrap"
        >
          {isDraft ? "continue writing" : "edit"}
        </button>

        <button
          onClick={() => setDeleteBox(true)}
          className="flex-1 md:flex-none font-mono text-[0.76rem] px-3.5 py-1.5 rounded-md border border-[#383a46] text-[#8b8d9b] hover:text-[#e18a8a] hover:border-[#e18a8a] transition-colors"
        >
          delete
        </button>
      </div>

      {deleteBox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70  px-4"
          onClick={() => setDeleteBox(false)}
        >
          <div
            className="w-full max-w-[420px] bg-[#23252e] border border-[#383a46] rounded-[10px] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[1.05rem] font-semibold text-[#e8e9ee] mb-2">
              Delete this post?
            </h2>

            <p className="text-[0.87rem] text-[#8b8d9b] leading-[1.55] mb-1">
              {post.title}
            </p>
            <p className="font-mono text-[0.76rem] text-[#e18a8a] mb-5">
              this action cannot be undone
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteBox(false)}
                className="font-mono text-[0.76rem] px-4 py-2 rounded-md border border-[#383a46] text-[#8b8d9b] hover:text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors"
              >
                cancel
              </button>

              <button
                onClick={() => {
                  setDeleteBox(false);
                  onDelete?.(postId);
                }}
                className="font-mono text-[0.76rem] px-4 py-2 rounded-md border border-[#e18a8a] text-[#e18a8a] hover:bg-[#e18a8a1a] transition-colors"
              >
                yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


export default function DevMyPosts({
  userName = "you",
  onEdit,
  onContinueWriting,
}) {
  const [serverPosts, setServerPosts] = useState([]);
  const [filter, setFilter] = useState("latest");
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const fetchMyPosts = async () => {
    try {
      const result = await getMyPostsFromServer();
      console.log("My posts API response:", result);
      setServerPosts(result.posts || []);
      setPosts(result.posts || []);
      setStatusFilter('all');
    } catch (error) {
      console.error("Failed to fetch my posts:", error);
    }
  };
  const getLatestPosts = (arr) => {
    const latestSorted = [...arr].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
    return latestSorted;
  }
  const getOldestPosts = (arr) => {
    const oldestSorted = [...arr].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    )
    return oldestSorted;
  }
  const handleStatus = (arr) => {
    if (statusFilter == 'published') {
      const newPosts = arr.filter((post) => {
        return post.status === 'published'
      })
      setFilter('latest')
      return newPosts;
    } else if (statusFilter == 'draft') {
      const newPosts = arr.filter((post) => {
        return post.status === 'draft';
      })
      setFilter('latest');
      return handleFilter(newPosts);
    } else if (statusFilter === 'all') {
      setFilter('latest')
      return arr;
    }
  }
  const handleFilter = (arr) => {
    if (filter === 'latest') {
      const newPosts = getLatestPosts(arr);
      return newPosts;
    } else if (filter === 'oldest') {
      const newPosts = getOldestPosts(arr);
      return newPosts;
    }
  }
  const handleSearch = async () => {
    if (searchQuery == "") {
      fetchMyPosts();
      setFilter('latest');
      setStatusFilter('all')
    } else {
      const response = await searchOwnFromServer(searchQuery);
      const respnosePosts = response?.posts || [];
      setServerPosts(respnosePosts);
      setStatusFilter('all');
      setFilter('latest');
      setPosts(getLatestPosts(respnosePosts));
    }
  }

  useEffect(() => {
    fetchMyPosts();
  }, []);

  useEffect(() => {
    const newArr = handleStatus(serverPosts);
    setPosts(newArr)
  }, [statusFilter])

  useEffect(() => {
    const newArr = handleFilter(posts);
    setPosts(newArr);
  }, [filter])

  const counts = useMemo(
    () => ({
      all: serverPosts.length,
      published: serverPosts.filter(
        (post) => post.status === "published"
      ).length,
      draft: serverPosts.filter(
        (post) => post.status === "draft"
      ).length,
    }),
    [serverPosts]
  );

  const totalLikes = useMemo(
    () =>
      serverPosts.reduce(
        (sum, post) =>
          sum +
          (Array.isArray(post.likes)
            ? post.likes.length
            : post.likes || 0),
        0
      ),
    [serverPosts]
  );
  const onDelete = async (postId) => {
    try {
      const response = await deleteMyPostFromServer(postId);

      if (response.deletedPost) {
        setPosts(prevPosts =>
          prevPosts.filter(post => post._id !== postId)
        );
        setServerPosts(prevPosts =>
          prevPosts.filter(post => post._id !== postId)
        );
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };



  return (
    <div className="min-h-screen bg-[#1e1f26] text-[#e8e9ee]">
      <main className="max-w-[1080px] mx-auto px-7 py-9 pb-20">
        <div className="font-mono text-[0.82rem] text-[#5a5c6b] mb-1.5">
          <div className="flex gap-3 mb-7">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
              placeholder="Search your posts..."
              className="flex-1 min-w-0 bg-[#23252e] border border-[#383a46] rounded-lg px-4 py-3 text-sm text-[#e8e9ee] placeholder:text-[#5a5c6b] outline-none focus:border-[#8fd19e] transition-colors"
            />

            <button
              className="px-6 py-3 bg-[#8fd19e] text-[#1e1f26] rounded-lg text-sm font-mono font-semibold hover:bg-[#a3dfb0] "
              onClick={() => {
                handleSearch();
              }}
            >
              Search
            </button>
          </div>
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
              onClick={() => setStatusFilter(item.key)}
              className={`font-mono text-[0.8rem] py-2 mr-[22px] border-b-2 transition-colors ${statusFilter === item.key
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
        <div className="flex items-center justify-between mb-6">
          <span className="font-mono text-[0.8rem] text-[#5a5c6b]">
            sort by
          </span>

          <div className="flex gap-2">
            {["latest", "oldest"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`font-mono text-[0.76rem] px-4 py-2 rounded-md border transition-colors ${filter === item
                  ? "text-[#8fd19e] border-[#8fd19e] bg-[#8fd19e1a]"
                  : "text-[#5a5c6b] border-[#383a46] hover:text-[#e8e9ee]"
                  }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        {posts.length === 0 ? (
          <div className="text-center py-16 px-5 border border-dashed border-[#383a46] rounded-[10px] text-[#5a5c6b]">
            <div className="font-mono text-[0.9rem] text-[#8fd19e] mb-2.5">
              // nothing here yet
            </div>

            <p className="text-[0.9rem] mb-4">
              {statusFilter === "draft"
                ? "No drafts in progress."
                : statusFilter === "published"
                  ? "No published posts yet."
                  : "You haven't created any posts yet."}
            </p>
          </div>
        ) : (
          posts.map((post) => (
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
