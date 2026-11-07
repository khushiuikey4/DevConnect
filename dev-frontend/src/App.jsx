import LandingPage from "./Components/LandingPage/LandingPage";
import AuthPage from "./Components/AuthenticationPage/AuthPage";
import DevHomePage from "./Components/DevHome/DevHomePage";
import MyProfile from "./Components/MyProfile/MyProfile";
import { useState, useEffect, userNavigate } from "react";
import { Routes, Route, useNavigate } from "react-router-dom"
import NewPost from "./Components/newPost/NewPost";
import { useSearchParams } from "react-router-dom";
import ProtectedRoute from "./Components/AuthenticationPage/protectedRoute";
import DevProfile from "./Components/DevProfile/devProfile";
import getOtherUserProfileFromServer from "./services/UserProfile"
import ReadPost from "./Components/DevHome/ReadPost/readPost";
import EditPost from "./Components/EditPost/editPost";


function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  let [tab, setTab] = useState(searchParams.get("tab") || "feed");
  const navigate = useNavigate();
  useEffect(() => {
    const tabFromURL = searchParams.get("tab");

    if (tabFromURL) {
      setTab(tabFromURL);
    }
  }, [searchParams]);
  const [devUserProfile, setDevUserProfile] = useState({});
  const [devUserPosts, setDevUserPosts] = useState([])
  async function gotoProfile(userId) {
    const data = await getOtherUserProfileFromServer(userId);
    if (data) {
      setDevUserProfile(data.devInformation);
      setDevUserPosts(data.devPosts)
    }
    navigate("/devProfile");
  }

  return (<>
    <Routes>
      <Route path="/" element={<LandingPage></LandingPage>} />
      <Route path="/authenticationPage" element={<AuthPage onLogin={true} onSignup={false}></AuthPage>} />
      <Route path="/devHomePage" element={<ProtectedRoute>
        <DevHomePage
          gotoProfile={gotoProfile}
          setSearchParams={setSearchParams}
          tab={tab}
          setTab={setTab}
        />
      </ProtectedRoute>} />
      <Route path="/newPostPage" element={<ProtectedRoute>
        <NewPost tab={tab} setTab={setTab} />
      </ProtectedRoute>} />
      <Route path="/MyProfileUpdate" element={<ProtectedRoute>
        <MyProfile />
      </ProtectedRoute>} />
      <Route path="/devProfile" element={<DevProfile profile={devUserProfile} posts={devUserPosts}></DevProfile>}></Route>
      <Route path="/post-details" element={<ReadPost />} />
      <Route path="/post/:id" element={<ReadPost />} />
      <Route path="/my-posts/edit/:postId" element={<ProtectedRoute>
        <EditPost tab={tab} setTab={setTab} />
      </ProtectedRoute>} />
    </Routes>

  </>
  )
}

export default App;