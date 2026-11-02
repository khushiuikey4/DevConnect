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