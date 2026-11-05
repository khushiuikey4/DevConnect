export async function addPostLikeToServer(postId, liked) {
    try {
        const response = await fetch('http://localhost:3000/postInteraction', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ postId: postId, task: 0, liked: liked })
        })
    } catch (error) {
        return {
            message: "Error from the backend in liking this post.",
            error: error.message
        }
    }
}
export async function savePostToServer(postId, saved) {
    try {
        const response = await fetch('http://localhost:3000/postInteraction', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ postId: postId, task: 1, saved: saved })
        })
    } catch (error) {
        return {
            message: "Error from the backend in saving this post",
            error: error.message
        }
    }
}
export async function addCommentToServer(postId, comment) {
    try {
        const response = await fetch('http://localhost:3000/postInteraction', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ postId: postId, task: 2, comment: comment })
        })
    } catch (error) {
        return {
            message: "Error from the backend in adding comment to this post",
            error: error.message
        }
    }
}
export async function getCommentsFromServer(postId) {
    try {
        const response = await fetch('http://localhost:3000/postInteraction', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ postId: postId, task: 3 })
        })
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch comments");
        }

        return data;

    } catch (error) {
        return {
            message: "Error from the backend in fetching comments for this post.",
            error: error.message
        }
    }
}
export async function addReplyToCommentOnServer(currentUserId, postId, commentId, replyText) {
    try {
        const response = await fetch('http://localhost:3000/postInteraction', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ postId: postId, task: 4, commentId: commentId, replyText: replyText, currentUserId: currentUserId })
        })
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to add reply");
        }

        return data;

    } catch (error) {
        return {
            message: "Error from the backend in fetching comments for this post.",
            error: error.message
        }
    }
}
export async function editCommentToServer(postId, commentId, editedCommentText) {
    try {
        const response = await fetch('http://localhost:3000/postInteraction', {
            method: 'POST',
            headers: { 'Content-Type': "application/json" },
            credentials: "include",
            body: JSON.stringify({ task: 5, commentId: commentId, editedCommentText: editedCommentText, postId })
        })
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to edit comment");
        }

        return data;
    } catch (error) {
        return {
            message: "Error from the backend in editing the comment",
            error: error.message
        }
    }
}
export async function deleteCommentFromServer(postId, commentId) {
    try {
        const response = await fetch('http://localhost:3000/postInteraction', {
            method: 'POST',
            headers: { 'Content-Type': "application/json" },
            credentials: "include",
            body: JSON.stringify({ task: 6, commentId: commentId, postId: postId })
        })
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to delete comment");
        }

        return data;
    } catch (error) {
        return {
            message: "Error from the backend in deleting the comment",
            error: error.message
        }
    }
}
export async function addCommentLikeToServer(postId, commentId, isLiked) {
    try {
        const response = await fetch('http://localhost:3000/postInteraction', {
            method: 'POST',
            headers: { 'Content-Type': "application/json" },
            credentials: "include",
            body: JSON.stringify({ task: 7, commentId: commentId, postId: postId, isLiked: isLiked })
        })
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to like comment");
        }

        return data;
    } catch (error) {
        return {
            message: "Error from the backend in liking the comment",
            error: error.message
        }
    }
}
export async function getPostFromServer(postId) {
    try {
        const response = await fetch('http://localhost:3000/postInteraction', {
            method: 'POST',
            headers: { 'Content-Type': "application/json" },
            credentials: "include",
            body: JSON.stringify({ task: 8, postId: postId })
        })
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch post");
        }

        return data.freshPost;
    } catch (error) {
        return {
            message: "Error from the backend in fetching the post",
            error: error.message
        }
    }
}