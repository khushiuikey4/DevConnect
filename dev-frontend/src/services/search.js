export const searchFromServer = async (searchQuery) => {
    try {
        const response = await fetch(`http://localhost:3000/search?q=${encodeURIComponent(searchQuery)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        })
        if (!response.ok) throw new Error("Failed to create post");
        const data = await response.json();
        return { ...data, success: response.ok };
    } catch (error) {
        console.error(error.message);
    }
}
export const fetchUPostsFromServer = async (searchList, upFilter, category) => {
    try {
        const response = await fetch(`http://localhost:3000/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
            , body: JSON.stringify({
                list: searchList,
                filter: upFilter,
                category: category
            })
        })
        if (!response.ok) throw new Error("Failed to create post");
        const data = await response.json();
        return { posts: data.posts, users: data.users, success: response.ok };
    } catch (error) {
        console.error(error.message);
    }
}
export const fetchLPostsFromServer = async (upList, lowFilter, category) => {
    try {
        const response = await fetch(`http://localhost:3000/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
            , body: JSON.stringify({
                list: upList,
                filter: lowFilter
            })
        })
        if (!response.ok) throw new Error("Failed to create post");
        const data = await response.json();
        return { posts: data.posts, users: data.users, success: response.ok };
    } catch (error) {
        console.error(error.message);
    }
}