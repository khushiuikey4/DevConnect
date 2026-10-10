export const getSavedPostsFromServer = async () => {
    const response = await fetch(
        "http://localhost:3000/saved",
        {
            method: "GET",
            credentials: "include"
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to fetch saved posts");
    }
    return result;
}