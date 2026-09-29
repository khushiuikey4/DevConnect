export const signupToServer = async (devInfo) => {
    const response = await fetch('http://localhost:3000/authentication/sign-up',
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(devInfo)
        }
    )
    console.log("STATUS:", response.status);

    const data = await response.json();

    console.log("SERVER RESPONSE:", data);

    if (response.status === 200) {
        return "login";
    }

    return "signup";
}
export const loginToServer = async (devInfo) => {
    const response = await fetch('http://localhost:3000/authentication/sign-in', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(devInfo)
    })
    const data = await response.json();
    console.log("Server Response : ", data);
    if (response.status === 200) {
        return true;
    }
    return false;
}