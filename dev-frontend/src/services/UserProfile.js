import { useNavigate } from "react-router-dom";
export async function getOtherUserProfileFromServer(userId) {
    try {
        const response = await fetch(`http://localhost:3000/userProfile/${userId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to get this user's profile");
        const data = await response.json();
        return { devInformation: data.devInformation, devPosts: data.devPosts, success: response.ok };
    } catch (error) {
        console.error(error.message);
    }
}
export async function followToggleOnServer(currentUserId, devId, isFollowing) {
    try {
        const response = await fetch(`http://localhost:3000/userProfile/followStatus`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ currentUserId, devId, isFollowing })
        });
        if (!response.ok) throw new Error("Failed to get this user's profile");
        const data = await response.json();
        return { devInformation: data.devInformation, devPosts: data.devPosts, success: response.ok };
    } catch (error) {
        console.error(error.message);
    }
}