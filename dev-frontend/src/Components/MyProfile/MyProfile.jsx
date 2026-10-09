
import { useState, useEffect } from "react";
import MyProfileHeader from "./MyProfileHeader";
import MyProfileForm from "./MyProfileForm";
import { getProfileFromServer } from "../../services/DevCrud";

export default function MyProfile() {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const result = await getProfileFromServer();
                setProfile(result.dev);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        }

        fetchProfile();
    }, []);

    return (
        <>
            <MyProfileHeader />

            {profile && (
                <MyProfileForm
                    profile={profile}
                    onSaved={(result) => setProfile(result.dev)}
                />
            )}
        </>
    );
}