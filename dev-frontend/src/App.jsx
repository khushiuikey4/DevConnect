import LandingPage from "./Components/LandingPage/LandingPage";
import AuthPage from "./Components/AuthenticationPage/AuthPage";
import DevHomePage from "./Components/DevHome/DevHomePage";
import MyProfile from "./Components/MyProfile/MyProfile";
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useSearchParams } from "react-router-dom";
import NewPost from "./Components/newPost/NewPost";
import ProtectedRoute from "./Components/AuthenticationPage/protectedRoute";
import DevProfile from "./Components/DevProfile/devProfile";
import { getOtherUserProfileFromServer } from "./services/UserProfile";
import ReadPost from "./Components/DevHome/ReadPost/readPost";
import EditPost from "./Components/EditPost/editPost";
import { getCurrentDevFromServer } from "./services/currentDev";

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "feed";
  const [tab, setTab] = useState(initialTab);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCurrentUser() {
      const user = await getCurrentDevFromServer();
      if (user?.currentDev) {
        setCurrentUser(user.currentDev);
      } else {
        console.log("couldn't fetch the current user.");
      }
    }
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const tabFromURL = searchParams.get("tab");
    if (tabFromURL && tabFromURL !== tab) {
      setTab(tabFromURL);
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const [devUserProfile, setDevUserProfile] = useState({});
  const [devUserPosts, setDevUserPosts] = useState([]);

  async function gotoProfile(userId) {
    if (!userId) return;
    try {
      const data = await getOtherUserProfileFromServer(userId);
      if (data) {
        setDevUserProfile(data.devInformation);
        setDevUserPosts(data.devPosts);
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
    }
    navigate(`/devProfile/${userId}`);
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/authenticationPage" element={<AuthPage onLogin={true} onSignup={false} />} />
        <Route
          path="/devHomePage"
          element={
            <ProtectedRoute>
              <DevHomePage
                gotoProfile={gotoProfile}
                setSearchParams={setSearchParams}
                tab={tab}
                setTab={handleTabChange}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/newPostPage"
          element={
            <ProtectedRoute>
              <NewPost tab={tab} setTab={handleTabChange} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/MyProfileUpdate"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/devProfile"
          element={
            <DevProfile
              profile={devUserProfile}
              currentUser={currentUser}
              posts={devUserPosts}
              gotoProfile={gotoProfile}
            />
          }
        />
        <Route
          path="/devProfile/:userId"
          element={
            <DevProfile
              profile={devUserProfile}
              currentUser={currentUser}
              posts={devUserPosts}
              gotoProfile={gotoProfile}
            />
          }
        />
        <Route path="/post-details" element={<ReadPost gotoProfile={gotoProfile} />} />
        <Route path="/post/:id" element={<ReadPost gotoProfile={gotoProfile} />} />
        <Route
          path="/my-posts/edit/:postId"
          element={
            <ProtectedRoute>
              <EditPost tab={tab} setTab={handleTabChange} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;