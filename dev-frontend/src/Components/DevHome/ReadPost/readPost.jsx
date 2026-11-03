
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    addCommentToServer,
    getCommentsFromServer,
    addReplyToCommentOnServer,
    editCommentToServer,
    deleteCommentFromServer,
    addCommentLikeToServer
} from "../../../services/postInteraction";
import { getCurrentDevFromServer } from "../../../services/currentDev";

import {
    MoreVertical,
    Pencil,
    Trash2,
    Heart,
    MessageCircle,
    Share2,
    Reply,
    Bookmark,
    ArrowLeft,
    MoreHorizontal,
    Send,
    UserRound,
    CalendarDays,
    Clock3,
    Code2,
    Sparkles,
    ChevronUp,
    ChevronDown,
    Check,
    X
} from "lucide-react";

// Stable default array
const EMPTY_COMMENTS = [];

const ReadPost = ({
    isSaved = false,
    onLike,
    onAddComment,
    onSave,
    onLikeComment,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const editTextareaRef = useRef(null);

    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const user = await getCurrentDevFromServer();
                setCurrentUser(user?.currentDev);
            } catch (error) {
                console.error("Unable to fetch current user:", error);
            }
        };

        fetchCurrentUser();
    }, []);

    const post = location.state?.post;

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [saved, setSaved] = useState(isSaved);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const currentUserId = currentUser?._id?.toString();

    const [replyTo, setReplyTo] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [expandedReplies, setExpandedReplies] = useState({});
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedCommentText, setEditedCommentText] = useState("");

    const handleEditComment = async (postId, commentId) => {
        try {
            await editCommentToServer(postId, commentId, editedCommentText);
            setEditingCommentId(null);
            setEditedCommentText("");
            await fetchComments();
        } catch (error) {
            console.error("Unable to edit comment:", error);
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        try {
            await deleteCommentFromServer(postId, commentId);
            await fetchComments();
        } catch (error) {
            console.error("Unable to delete comment:", error);
        }
    };

    // Update only the likes of the selected comment.
    const updateCommentLikes = (commentId, likes) => {
        setComments(prev =>
            prev.map(comment =>
                comment._id === commentId
                    ? { ...comment, likes }
                    : comment
            )
        );
    };

    // Handle comment like/unlike.
    const handleCommentLike = async (
        postId,
        commentId,
        nextLiked,
        previousLikes
    ) => {
        try {
            const response = await addCommentLikeToServer(
                postId,
                commentId,
                nextLiked
            );

            if (response?.error) {
                throw new Error(response.error);
            }

            // Fetch the latest comment data from the server.
            await fetchComments();

        } catch (error) {
            console.error("Unable to update comment like:", error);

            // Restore the previous likes if the request fails.
            updateCommentLikes(commentId, previousLikes);
        }
    };

    // Fetch comments from server
    const fetchComments = async () => {
        if (!post?._id) return;

        try {
            const response = await getCommentsFromServer(post._id);

            console.log("Comments API response:", response);

            setComments(response.comments || []);
        } catch (error) {
            console.error("Unable to fetch comments:", error);
        }
    };

    // Fetch comments when post changes
    useEffect(() => {
        fetchComments();
    }, [post?._id]);

    // Fetch current post interaction states
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

    // Submit a reply
    const handleReply = async (commentId) => {
        const content = replyText.trim();

        if (!content) return;

        try {
            await addReplyToCommentOnServer(
                currentUserId,
                post._id,
                commentId,
                content
            );

            setReplyText("");
            setReplyTo(null);

            // Expand replies after submitting
            setExpandedReplies(prev => ({
                ...prev,
                [commentId]: true
            }));

            // Fetch updated comments, including the new reply
            await fetchComments();

        } catch (error) {
            console.error("Unable to add reply:", error);
        }
    };

    // Expand/collapse replies
    const toggleReplies = (commentId) => {
        setExpandedReplies(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };

    // Convert flat comments array into a nested comment tree
    const buildCommentTree = (comments, parentId = null) => {
        return comments
            .filter(comment => {
                const commentParentId = comment.parentComment
                    ? comment.parentComment.toString()
                    : null;

                return commentParentId === parentId;
            })
            .map(comment => ({
                ...comment,
                replies: buildCommentTree(
                    comments,
                    comment._id.toString()
                )
            }));
    };

    const arrangedComments = buildCommentTree(comments);

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

            // Fetch updated comments
            await fetchComments();

            setNewComment("");

        } catch (error) {
            console.error("Unable to add comment:", error);
        } finally {
            setSubmitting(false);
        }
    };

    // Recursively render comments and their replies
    const renderComment = (comment) => {
        const commentAuthor = getCommentAuthor(comment);
        const commentAvatar = comment.author?.avatar;

        const commentAvatarUrl = commentAvatar
            ? commentAvatar.startsWith("http")
                ? commentAvatar
                : `http://localhost:3000${commentAvatar.startsWith("/") ? "" : "/"}${commentAvatar}`
            : "";

        // Determine whether the current user liked this comment.
        const isLiked = comment.likes?.some(like => {
            const likeUserId = like?._id || like;
            return likeUserId?.toString() === currentUserId;
        }) ?? false;

        // The count comes from the same state that is updated optimistically.
        const commentLikeCount = comment.likes?.length || 0;

        const replies = comment.replies || [];

        return (
            <div key={comment._id}>

                {/* Main Comment */}
                <div className="flex items-start gap-3">

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

                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-100 text-sm font-semibold">
                                {commentAuthor}
                            </span>
                            <span className="text-gray-500 text-xs">
                                {formatDate(comment.createdAt)}
                            </span>
                            <div className="relative ml-auto">
                                <button
                                    onClick={() =>
                                        setActiveMenu(
                                            activeMenu === comment._id ? null : comment._id
                                        )
                                    }
                                    className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-[#30323d]"
                                >
                                    <MoreVertical size={18} />
                                </button>

                                {activeMenu === comment._id && (
                                    <div className="absolute right-0 top-8 z-20 w-36 bg-[#30323d] border border-[#444651] rounded-lg shadow-xl py-1">

                                        <button
                                            onClick={() => {
                                                setEditingCommentId(comment._id);
                                                setEditedCommentText(comment.comment);
                                                setActiveMenu(null);
                                                // handleEditComment(currentUser._id, comment)
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#41434e]"
                                        >
                                            <Pencil size={14} />
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => {
                                                setActiveMenu(null);
                                                handleDeleteComment(post._id, comment._id);
                                                // handleDeleteComment(comment._id)
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[#41434e]"
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>

                                    </div>
                                )}
                            </div>
                        </div>

                        {editingCommentId === comment._id ? (
                            <div className="flex items-center gap-2 mt-2">
                                <textarea
                                    ref={editTextareaRef}
                                    value={editedCommentText}
                                    onChange={(e) => setEditedCommentText(e.target.value)}
                                    className="flex-1 bg-[#1e2029] border border-[#383a45] rounded-lg p-3 text-sm text-gray-200 outline-none focus:border-[#8bd19e] resize-none"
                                    rows={2}
                                    autoFocus
                                    onFocus={(e) => {
                                        const length = e.target.value.length;
                                        e.target.setSelectionRange(length, length);
                                    }}
                                />

                                <button
                                    onClick={() => handleEditComment(post._id, comment._id)}
                                    disabled={!editedCommentText.trim()}
                                    className="p-2 text-[#8bd19e] hover:bg-[#303b3a] rounded-lg disabled:opacity-40"
                                    title="Save changes"
                                >
                                    <Check size={19} />
                                </button>

                                <button
                                    onClick={() => {
                                        setEditingCommentId(null);
                                        setEditedCommentText("");
                                    }}
                                    className="p-2 text-gray-400 hover:bg-[#30323d] rounded-lg"
                                    title="Cancel"
                                >
                                    <X size={19} />
                                </button>
                            </div>
                        ) : (
                            <p className="text-gray-300 text-sm leading-7 break-words">
                                {comment.comment}
                            </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-5 mt-2">

                            <button
                                onClick={() => {
                                    if (!currentUserId) return;

                                    const previousLikes = comment.likes || [];
                                    const nextLiked = !isLiked;

                                    // Prepare the optimistic likes array.
                                    const updatedLikes = nextLiked
                                        ? [...previousLikes, currentUserId]
                                        : previousLikes.filter(like => {
                                            const likeUserId = like?._id || like;
                                            return likeUserId?.toString() !== currentUserId;
                                        });

                                    // Immediately update the heart and count.
                                    updateCommentLikes(comment._id, updatedLikes);

                                    // Send the request and roll back if it fails.
                                    handleCommentLike(
                                        post._id,
                                        comment._id,
                                        nextLiked,
                                        previousLikes
                                    );
                                }}
                                className={`flex items-center gap-1.5 text-xs ${isLiked
                                    ? "text-red-400"
                                    : "text-gray-500 hover:text-red-400"
                                    }`}
                            >
                                <Heart
                                    size={15}
                                    fill={isLiked ? "currentColor" : "none"}
                                />
                                {commentLikeCount}
                            </button>

                            <button
                                onClick={() => {
                                    setReplyTo(
                                        replyTo === comment._id
                                            ? null
                                            : comment._id
                                    );
                                    setReplyText("");
                                }}
                                className="text-xs font-medium text-gray-400 hover:text-[#8bd19e]"
                            >
                                <span className="flex items-center gap-1">
                                    <Reply size={14} />
                                    Reply
                                </span>
                            </button>

                        </div>

                        {/* Reply Input */}
                        {replyTo === comment._id && (
                            <div className="flex gap-2 mt-4">

                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    placeholder={`Reply to ${commentAuthor}...`}
                                    className="flex-1 min-w-0 bg-[#1e2029] border border-[#383a45] rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-[#8bd19e]"
                                />

                                <button
                                    onClick={() => handleReply(comment._id)}
                                    disabled={!replyText.trim()}
                                    className="px-3 rounded-lg bg-[#8bd19e] text-[#1e2029] disabled:opacity-40"
                                >
                                    <Send size={16} />
                                </button>

                            </div>
                        )}

                        {/* View Replies Toggle */}
                        {replies.length > 0 && (
                            <button
                                onClick={() => toggleReplies(comment._id)}
                                className="flex items-center gap-2 mt-4 text-xs font-semibold text-[#8bd19e] hover:text-[#a8e5b5] transition-colors"
                            >
                                {expandedReplies[comment._id] ? (
                                    <>
                                        <ChevronUp size={16} />
                                        Hide replies
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown size={16} />
                                        View {replies.length} {replies.length === 1 ? "reply" : "replies"}
                                    </>
                                )}
                            </button>
                        )}

                        {/* Recursively Render Replies */}
                        {expandedReplies[comment._id] && replies.length > 0 && (
                            <div className="mt-4 ml-1 pl-4 border-l-2 border-[#383a45] space-y-5">

                                {replies.map(reply =>
                                    renderComment(reply)
                                )}

                            </div>
                        )}

                    </div>
                </div>

            </div>
        );
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
                    <div className="w-full bg-[#242630] border border-[#383a45] rounded-xl p-5 sm:p-7">

                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-semibold text-gray-200">
                                All comments
                            </h3>

                            <span className="text-xs text-gray-500">
                                {comments.length} comments
                            </span>
                        </div>

                        <div className="space-y-7">

                            {arrangedComments.length > 0 ? (
                                arrangedComments.map(comment =>
                                    renderComment(comment)
                                )
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
