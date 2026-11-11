export const searchFromServer = async (searchQuery = "", cursor = null, filter = "", type = "") => {
    try {
        const params = new URLSearchParams();
        if (searchQuery !== undefined && searchQuery !== null && searchQuery !== "") {
            params.append("q", searchQuery);
        }
        if (cursor) params.append("cursor", cursor);
        if (filter) params.append("filter", filter);
        if (type) params.append("type", type);

        const url = `http://localhost:3000/search${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        });
        if (!response.ok) throw new Error("Failed to fetch search results");
        const data = await response.json();
        return { ...data, success: response.ok };
    } catch (error) {
        console.error(error.message);
    }
};

export const searchOwnFromServer = async (searchQuery) => {
    try {
        const response = await fetch(`http://localhost:3000/search/dev?q=${encodeURIComponent(searchQuery)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        });
        if (!response.ok) throw new Error("Failed to search own post");
        const data = await response.json();
        return { ...data, success: response.ok };
    } catch (error) {
        console.error(error.message);
    }
};

export const searchSavedFromServer = async (searchQuery) => {
    try {
        const response = await fetch(`http://localhost:3000/search/saved?q=${encodeURIComponent(searchQuery)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        });
        if (!response.ok) throw new Error("Failed to find saved post");
        const data = await response.json();
        return { ...data, success: response.ok };
    } catch (error) {
        console.error(error.message);
    }
};

export const fetchUPostsFromServer = async (searchList, upFilter, category) => {
    try {
        const response = await fetch(`http://localhost:3000/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                list: searchList,
                filter: upFilter,
                category: category
            })
        });
        if (!response.ok) throw new Error("Failed to filter posts");
        const data = await response.json();
        return { posts: data.posts, users: data.users, success: response.ok };
    } catch (error) {
        console.error(error.message);
    }
};

export const fetchLPostsFromServer = async (upList, lowFilter, category) => {
    try {
        const response = await fetch(`http://localhost:3000/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                list: upList,
                filter: lowFilter
            })
        });
        if (!response.ok) throw new Error("Failed to filter posts");
        const data = await response.json();
        return { posts: data.posts, users: data.users, success: response.ok };
    } catch (error) {
        console.error(error.message);
    }
};
