export const getMyPostsFromServer = async () => {
    const response = await fetch(
        "http://localhost:3000/my-posts",
        {
            method: "GET",
            credentials: "include"
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to fetch profile");
    }
    return result;
}
export const getMyPostFromServer = async (postId) => {
    const response = await fetch('http://localhost:3000/my-posts/get-post', {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId })
    })
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to fetch post");
    }
    return result;
}
export const deleteMyPostFromServer = async (postId) => {
    const response = await fetch("http://localhost:3000/my-posts/delete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId })
    })
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to fetch profile");
    }
    return result;
}
export const editPostToServer = async ({ postId, title, excerpt, content, tags, status }) => {
    const response = await fetch('http://localhost:3000/my-posts/edit', {
        method: 'POST',
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, title, excerpt, content, tags, status })
    })
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Failed to edit post");
    }
    return result;
}
//ytfggt