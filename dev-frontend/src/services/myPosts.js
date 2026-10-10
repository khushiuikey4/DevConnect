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