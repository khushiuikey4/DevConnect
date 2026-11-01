export async function getCurrentDevFromServer(req, res) {
    try {
        const response = await fetch(
            "http://localhost:3000/get-me",
            {
                method: "GET",
                credentials: "include"
            }
        );
        const result = await response.json();
        return result;
    } catch (error) {
        return {
            message: "Some error in fetching current user Information",
            Error: error.message
        }
    }
}