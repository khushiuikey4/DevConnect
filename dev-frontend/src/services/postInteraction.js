export async function addPostLikeToServer(postId, liked) {
    try {
        const response = fetch('http://localhost:3000/postInteraction', {
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