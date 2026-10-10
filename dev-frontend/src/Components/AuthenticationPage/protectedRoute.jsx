import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getProfileFromServer } from "../../services/DevCrud";
function ProtectedRoute({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(null)
    useEffect(() => {
        getProfileFromServer().then(() => setIsLoggedIn(true)).catch(() => setIsLoggedIn(false))
    }, [])
    if (isLoggedIn === null) {
        return <p>Checking Login...</p>;
    }
    return isLoggedIn
        ? children
        : <Navigate to="/authenticationPage" replace />;
}
export default ProtectedRoute;