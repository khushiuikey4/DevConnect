
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { addCommentToServer, getCommentsFromServer } from "../../../services/postInteraction"
import {
    Heart,
    MessageCircle,
    Share2,
    Bookmark,
    ArrowLeft,
    MoreHorizontal,
    Send,
    UserRound,
    CalendarDays,
    Clock3,
    Code2,
    Sparkles,
} from "lucide-react";

// Stable default array
const EMPTY_COMMENTS = [];

const ReadPost = ({
    currentUser,
    isSaved = false,
    onLike,
    onAddComment,
    onSave,
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const post = location.state?.post;

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [saved, setSaved] = useState(isSaved);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);


    const currentUserId = currentUser?._id?.toString();


    // Synchronize post interaction states
    useEffect(() => {
        if (!post?._id) return;

        const fetchComments = async () => {
            try {
                const response = await getCommentsFromServer(post._id);

                console.log("Comments API response:", response);

                setComments(response.comments || []);
            } catch (error) {
                console.error("Unable to fetch comments:", error);
            }
        };

        fetchComments();
    }, [post?._id]);
    useEffect(() => {
        if (!post) return;

        const postLikes = post.likes || [];

        setLikeCount(postLikes.length);

        setLiked(
            postLikes.some((user) => {
                const userId = user?._id || user;
                return userId?.toString() === currentUserId;
            })
        );

        setSaved(isSaved);
    }, [post, currentUserId, isSaved]);

    // Use content as the dependency instead of array reference.
    // This prevents repeated updates when the parent creates a new
    // array containing the same comments on every render.
    // const initialCommentsKey = JSON.stringify(initialComments);

    // useEffect(() => {
    //     setComments(initialComments);
    // }, [initialCommentsKey]);

    if (!post) {
        return (
            <div className="min-h-screen w-full bg-[#1e1f26] text-gray-400 flex items-center justify-center">
                <div className="text-center">
                    <Code2 size={42} className="mx-auto mb-4 text-[#8bd19e]" />

                    <h2 className="text-xl text-gray-200 font-semibold">
                        Post not found
                    </h2>

                    <p className="text-sm mt-2">
                        Please open a post from your feed.
                    </p>

                    <button
                        onClick={() => navigate(-1)}
                        className="mt-5 px-5 py-2 rounded-lg bg-[#8bd19e] text-[#17251c] font-semibold"
                    >
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    const author = post.author || {};

    const authorName =
        author.username || author.name || "Unknown user";

    const avatar = author.avatar;

    const avatarUrl = avatar
        ? avatar.startsWith("http")
            ? avatar
            : `http://localhost:3000${avatar.startsWith("/") ? "" : "/"}${avatar}`
        : "";

    const formatDate = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const getCommentAuthor = (comment) => {
        return (
            comment.author?.username ||
            comment.user?.username ||
            comment.username ||
            "Anonymous"
        );
    };

    const handleLike = async () => {
        const nextLiked = !liked;

        setLiked(nextLiked);
        setLikeCount((prev) => prev + (nextLiked ? 1 : -1));

        try {
            await onLike?.(post._id, nextLiked);
        } catch (error) {
            setLiked(!nextLiked);
            setLikeCount((prev) => prev + (nextLiked ? -1 : 1));
            console.error("Unable to update like:", error);
        }
    };

    const handleSave = async () => {
        const nextSaved = !saved;

        setSaved(nextSaved);

        try {
            await onSave?.(post._id, nextSaved);
        } catch (error) {
            setSaved(!nextSaved);
            console.error("Unable to save post:", error);
        }
    };

    const handleShare = async () => {
        const postUrl = window.location.href;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: post.title,
                    text: post.excerpt || post.title,
                    url: postUrl,
                });
            } else {
                await navigator.clipboard.writeText(postUrl);
                alert("Post link copied!");
            }
        } catch (error) {
            if (error.name !== "AbortError") {
                console.error("Unable to share post:", error);
            }
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();

        const content = newComment.trim();

        if (!content || submitting) return;

        setSubmitting(true);

        try {
            await addCommentToServer(post._id, content);

            // Fetch the updated comments
            const response = await getCommentsFromServer(post._id);

            setComments(response.comments || []);
            setNewComment("");

        } catch (error) {
            console.error("Unable to add comment:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#1e1f26] text-gray-200">

            {/* Top Navigation */}
            <header className="w-full border-b border-[#383a45] bg-[#242630] sticky top-0 z-30 shadow-lg shadow-black/10">
                <div className="w-full px-5 sm:px-8 lg:px-12 py-4 flex items-center justify-between">

                    <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#e98c91]" />
                            <span className="w-2.5 h-2.5 rounded-full bg-[#e9b27e]" />
                            <span className="w-2.5 h-2.5 rounded-full bg-[#8bd19e]" />
                        </div>

                        <div className="h-6 w-px bg-[#444651] mx-1" />

                        <Code2 size={19} className="text-[#8bd19e]" />

                        <span className="text-gray-200 font-semibold text-sm tracking-wide">
                            DevConnect
                        </span>

                        <span className="hidden sm:inline text-gray-500 text-xs font-mono">
                            / post-details
                        </span>
                    </div>

                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#444651] text-gray-400 hover:text-[#8bd19e] hover:border-[#8bd19e]/50 transition text-sm"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>

                </div>
            </header>

            {/* Main Content */}
            <main className="w-full px-4 sm:px-7 lg:px-12 py-7 sm:py-10">

                {/* Page Heading */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">

                    <div>
                        <div className="flex items-center gap-2 text-[#8bd19e] text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                            <Sparkles size={14} />
                            Developer Community
                        </div>

                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-100 tracking-tight">
                            Explore the discussion<span className="text-[#8bd19e]">.</span>
                        </h1>

                        <p className="text-gray-500 text-sm mt-2">
                            Ideas, experiences, and knowledge shared by developers.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-[#8bd19e]" />
                        Developer discussion
                    </div>

                </div>

                {/* Full Width Post Card */}
                <article className="w-full bg-[#242630] border border-[#383a45] rounded-2xl overflow-hidden shadow-xl shadow-black/10">

                    {/* Top Accent */}
                    <div className="h-1 w-full bg-gradient-to-r from-[#638d70] via-[#8bd19e] to-transparent" />

                    <div className="p-5 sm:p-8 lg:p-10">

                        {/* Author Details */}
                        <div className="flex items-center justify-between gap-4 mb-8">

                            <div className="flex items-center gap-4 min-w-0">

                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={authorName}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <UserRound className="w-10 h-10 rounded-full p-2 bg-gray-700" />
                                )}

                                <div className="min-w-0">
                                    <p className="text-gray-100 font-semibold text-base truncate">
                                        {authorName}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-gray-500 text-xs">
                                        <span className="flex items-center gap-1.5">
                                            <CalendarDays size={13} />
                                            {formatDate(post.createdAt)}
                                        </span>

                                        <span className="flex items-center gap-1.5">
                                            <Clock3 size={13} />
                                            {Math.max(1, Math.ceil((post.content?.trim().split(/\s+/).length || 0) / 200))} min read
                                        </span>
                                    </div>
                                </div>

                            </div>

                            <button
                                className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-[#30323d] transition shrink-0"
                                title="More options"
                            >
                                <MoreHorizontal size={22} />
                            </button>

                        </div>

                        {/* Post Status */}
                        <div className="mb-5">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#303b3a] text-[#8bd19e] text-xs font-medium border border-[#8bd19e]/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#8bd19e]" />
                                {post.status === "draft" ? "Draft" : "Published"}
                            </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-100 leading-tight tracking-tight mb-6">
                            {post.title}
                        </h2>

                        {/* Excerpt */}
                        {post.excerpt && (
                            <p className="text-gray-400 text-base sm:text-lg leading-8 border-l-2 border-[#8bd19e] pl-5 mb-8">
                                {post.excerpt}
                            </p>
                        )}

                        {/* Divider */}
                        <div className="border-t border-[#383a45] mb-8" />

                        {/* Complete Post Content */}
                        <div className="w-full text-gray-300 text-[15px] sm:text-base leading-8 whitespace-pre-wrap break-words">
                            {post.content}
                        </div>

                        {/* Tags */}
                        {post.tags?.length > 0 && (
                            <div className="mt-10 pt-7 border-t border-[#383a45]">

                                <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-4">
                                    Topics discussed
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 rounded-lg bg-[#303b3a] border border-[#8bd19e]/10 text-[#8bd6a1] text-sm hover:border-[#8bd19e]/40 transition"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                            </div>
                        )}

                        {/* Post Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-5 border-t border-[#383a45] mt-9 pt-6">

                            <div className="flex items-center gap-3 sm:gap-6">

                                {/* Like */}
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition ${liked
                                        ? "text-rose-400 bg-rose-400/10 border-rose-400/20"
                                        : "text-gray-400 border-[#444651] hover:text-rose-400 hover:border-rose-400/30"
                                        }`}
                                >
                                    <Heart
                                        size={19}
                                        fill={liked ? "currentColor" : "none"}
                                    />

                                    <span className="text-sm font-medium">
                                        {likeCount} Likes
                                    </span>
                                </button>

                                {/* Comments */}
                                <button
                                    onClick={() =>
                                        document.getElementById("comments-section")?.scrollIntoView({
                                            behavior: "smooth",
                                        })
                                    }
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#444651] text-gray-400 hover:text-blue-400 hover:border-blue-400/30 transition"
                                >
                                    <MessageCircle size={19} />

                                    <span className="text-sm font-medium">
                                        {comments.length} Comments
                                    </span>
                                </button>

                            </div>

                            <div className="flex items-center gap-3">

                                {/* Share */}
                                <button
                                    onClick={handleShare}
                                    title="Share post"
                                    className="p-3 rounded-lg border border-[#444651] text-gray-400 hover:text-[#8bd19e] hover:border-[#8bd19e]/40 transition"
                                >
                                    <Share2 size={19} />
                                </button>

                                {/* Save */}
                                <button
                                    onClick={handleSave}
                                    title={saved ? "Remove from saved" : "Save post"}
                                    className={`p-3 rounded-lg border transition ${saved
                                        ? "text-[#8bd19e] bg-[#8bd19e]/10 border-[#8bd19e]/30"
                                        : "text-gray-400 border-[#444651] hover:text-[#8bd19e] hover:border-[#8bd19e]/40"
                                        }`}
                                >
                                    <Bookmark
                                        size={19}
                                        fill={saved ? "currentColor" : "none"}
                                    />
                                </button>

                            </div>
                        </div>

                    </div>
                </article>

                {/* Comments Section */}
                <section
                    id="comments-section"
                    className="w-full mt-10"
                >

                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-100">
                                Discussion
                            </h2>

                            <p className="text-gray-500 text-sm mt-1">
                                Join the conversation and share your thoughts.
                            </p>
                        </div>

                        <span className="px-3 py-1.5 rounded-lg bg-[#303b3a] text-[#8bd19e] text-sm font-semibold">
                            {comments.length}
                        </span>
                    </div>

                    {/* Add Comment */}
                    <form
                        onSubmit={handleComment}
                        className="w-full bg-[#242630] border border-[#383a45] rounded-xl p-5 sm:p-6 mb-8 focus-within:border-[#8bd19e]/40 transition"
                    >

                        <div className="flex items-center gap-3 mb-4">
                            {currentUser?.avatar ? (
                                <img
                                    src={
                                        currentUser.avatar.startsWith("http")
                                            ? currentUser.avatar
                                            : `http://localhost:3000${currentUser.avatar}`
                                    }
                                    alt="You"
                                    className="w-9 h-9 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-[#303b3a] flex items-center justify-center">
                                    <UserRound size={17} className="text-[#8bd19e]" />
                                </div>
                            )}

                            <span className="text-gray-300 text-sm font-medium">
                                Add to the discussion
                            </span>
                        </div>

                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts, ideas or feedback..."
                            rows={4}
                            className="w-full bg-[#1e1f26] border border-[#383a45] rounded-lg p-4 resize-y outline-none text-gray-200 placeholder:text-gray-500 text-sm leading-7 focus:border-[#8bd19e]/50 transition"
                        />

                        <div className="flex justify-end mt-4">

                            <button
                                // onClick={() => {
                                //     addCommentToServer(post._id, newComment,)
                                // }}
                                type="submit"
                                disabled={!newComment.trim() || submitting}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#8bd19e] text-[#17251c] text-sm font-semibold hover:bg-[#9be0ad] disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                {submitting ? "Posting..." : "Post comment"}
                                <Send size={15} />
                            </button>

                        </div>

                    </form>

                    {/* Existing Comments */}

                    {/* Existing Comments */}
                    <div className="w-full bg-[#242630] border border-[#383a45] rounded-xl p-5 sm:p-7">

                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-semibold text-gray-200">
                                All comments
                            </h3>

                            <span className="text-xs text-gray-500">
                                {comments.length} comments
                            </span>
                        </div>

                        <div className="space-y-4">

                            {comments.length > 0 ? (
                                comments.map((comment) => {

                                    const commentAuthor =
                                        comment.author?.username || "Anonymous";

                                    const commentAvatar = comment.author?.avatar;

                                    const commentAvatarUrl = commentAvatar
                                        ? commentAvatar.startsWith("http")
                                            ? commentAvatar
                                            : `http://localhost:3000${commentAvatar}`
                                        : "";

                                    return (
                                        <div
                                            key={comment._id}
                                            className="flex items-start gap-4 p-4 rounded-xl bg-[#1e2029] border border-[#343743] hover:border-[#454957] transition-colors"
                                        >

                                            {commentAvatarUrl ? (
                                                <img
                                                    src={commentAvatarUrl}
                                                    alt={commentAuthor}
                                                    className="w-10 h-10 rounded-full object-cover shrink-0"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 shrink-0 rounded-full bg-[#303b3a] flex items-center justify-center text-[#a8d9b3]">
                                                    <UserRound size={18} />
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">

                                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">

                                                    <span className="text-gray-100 text-sm font-semibold">
                                                        {commentAuthor}
                                                    </span>

                                                    <span className="text-gray-500 text-xs">
                                                        {formatDate(comment.updatedAt)}
                                                    </span>

                                                </div>

                                                <p className="text-gray-300 text-sm leading-7 break-words">
                                                    {comment.comment || comment.text}
                                                </p>

                                            </div>

                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-12">

                                    <div className="w-14 h-14 mx-auto rounded-2xl bg-[#303b3a] flex items-center justify-center mb-4">
                                        <MessageCircle
                                            size={25}
                                            className="text-[#8bd19e]"
                                        />
                                    </div>

                                    <p className="text-gray-200 font-medium text-sm">
                                        No comments yet
                                    </p>

                                    <p className="text-gray-500 text-xs mt-2">
                                        Be the first to share your thoughts!
                                    </p>

                                </div>
                            )}

                        </div>
                    </div>


                </section>

            </main>

            {/* Footer */}
            <footer className="w-full border-t border-[#383a45] mt-10 py-6 px-5 sm:px-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-600 text-xs">
                    <span className="font-mono">
                        {"< DevConnect />"}
                    </span>

                    <span>
                        Built for developers, by developers.
                    </span>
                </div>
            </footer>

        </div>
    );
};

export default ReadPost;
