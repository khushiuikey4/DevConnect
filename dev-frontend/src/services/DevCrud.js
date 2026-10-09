export async function updateProfileToServer(pendingChanges) {
    const formData = new FormData();
    formData.append("fields", JSON.stringify(pendingChanges.fields));
    if (pendingChanges.avatarFile) {
        formData.append("avatarFile", pendingChanges.avatarFile)
    }
    formData.append("removeAvatar", String(pendingChanges.removeAvatar));
    // 4. Send the request
    const response = await fetch("http://localhost:3000/dev/update-dev", { method: "POST", credentials: "include", body: formData });
    const result = await response.json();
    if (!response.ok) { throw new Error(result.message || "Profile update failed"); }
    return result;
}


export async function getProfileFromServer() {
    const response = await fetch(
        "http://localhost:3000/dev/get-dev",
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