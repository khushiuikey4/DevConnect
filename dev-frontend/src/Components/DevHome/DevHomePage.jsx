import DevHeader from "./DevHeader"
import DevContainer from "./DevContainer"
import DevMyPosts from "./DevMyPosts"
import DevSaved from "./DevSaved"
import DevExplore from "./DevExplore"
import { getProfileFromServer } from "../../services/DevCrud";
import { useState, useEffect } from "react";


export default function DevHomePage({ tab, setTab, setSearchParams }) {
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
    return <>
        <DevHeader setSearchParams={setSearchParams} activeTab={tab} setTab={setTab} profile={profile}></DevHeader>
        {tab == "feed" && < DevContainer></DevContainer>}
        {tab == "my-posts" && <DevMyPosts></DevMyPosts>}
        {tab == "saved" && <DevSaved></DevSaved>}
        {tab == "explore" && <DevExplore></DevExplore>}
    </>
}
