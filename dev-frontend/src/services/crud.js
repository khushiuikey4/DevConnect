import { useNavigate } from "react-router-dom";

export const addPostToServer = async (postInfo) => {
    try {
        const response = await fetch("http://localhost:3000/dev/add-new-post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(postInfo),
        });

        if (!response.ok) throw new Error("Failed to create post");
        return await response.json();
    } catch (error) {
        console.error(error.message);
    }
};