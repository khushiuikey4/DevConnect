import AuthPage from "./Components/AuthPage";
import LandingPageHeader from "./Components/landingPageHeader";
import LandingHero from "./Components/LandingHero";
import LandingExplore from "./Components/LandingExplore";
import LandingWork from "./Components/LandingWork";
import LandingFooter from "./Components/LandingFooter";
import DevHeader from "./Components/DevHeader";
import DevFeed from "./Components/DevFeed";
import DevContainer from "./Components/DevContainer";
import DevMyPosts from "./Components/DevMyPosts";
import DevSaved from "./Components/DevSaved";
import DevExplore from "./Components/DevExplore";
import { useState } from "react";
import LandingPage from "./Components/LandingPage";
import { Routes, Route } from "react-router-dom"

function App() {
  let [tab, setTab] = useState("feed");

  return (<>
    <Routes>
      <Route path="/landingPage" element={<LandingPage></LandingPage>} />
      <Route path="/authentication" element={<AuthPage onLogin={true} onSignup={false}></AuthPage>} />
    </Routes>


    <DevHeader activeTab={tab} setTab={setTab}></DevHeader>
    {tab == "feed" && < DevContainer></DevContainer>}
    {tab == "my-posts" && <DevMyPosts></DevMyPosts>}
    {tab == "saved" && <DevSaved></DevSaved>}
    {tab == "explore" && <DevExplore></DevExplore>}
  </>
  )
}

export default App;