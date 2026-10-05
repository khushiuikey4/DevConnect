import DevHeader from "./DevHeader"
import DevContainer from "./DevContainer"
import DevMyPosts from "./DevMyPosts"
import DevSaved from "./DevSaved"
import DevExplore from "./DevExplore"
import { useState } from "react"

export default function DevHomePage({ tab, setTab, setSearchParams }) {
    return <>
        <DevHeader setSearchParams={setSearchParams} activeTab={tab} setTab={setTab}></DevHeader>
        {tab == "feed" && < DevContainer></DevContainer>}
        {tab == "my-posts" && <DevMyPosts></DevMyPosts>}
        {tab == "saved" && <DevSaved></DevSaved>}
        {tab == "explore" && <DevExplore></DevExplore>}
    </>
}
