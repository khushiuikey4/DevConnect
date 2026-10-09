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
        const data = await response.json();
        return { ...data, success: response.ok };
    } catch (error) {
        console.error(error.message);
    }
};