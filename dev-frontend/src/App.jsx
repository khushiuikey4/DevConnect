import LandingPage from "./Components/LandingPage/LandingPage";
import AuthPage from "./Components/AuthenticationPage/AuthPage";
import DevHomePage from "./Components/DevHome/DevHomePage";
import MyProfile from "./Components/MyProfile/MyProfile";
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom"
import NewPost from "./Components/newPost/NewPost";
import { useSearchParams } from "react-router-dom";


function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  let [tab, setTab] = useState(searchParams.get("tab") || "feed");
  useEffect(() => {
    const tabFromURL = searchParams.get("tab");

    if (tabFromURL) {
      setTab(tabFromURL);
    }
  }, [searchParams]);

  return (<>
    <Routes>
      <Route path="/" element={<LandingPage></LandingPage>} />
      <Route path="/authenticationPage" element={<AuthPage onLogin={true} onSignup={false}></AuthPage>} />
      <Route path="/devHomePage" element={<DevHomePage setSearchParams={setSearchParams} tab={tab} setTab={setTab} ></DevHomePage>} />
      <Route path="/newPostPage" element={<NewPost tab={tab} setTab={setTab}></NewPost>} />
      <Route path="/MyProfileUpdate" element={<MyProfile></MyProfile>} />
    </Routes>

  </>
  )
}

export default App;