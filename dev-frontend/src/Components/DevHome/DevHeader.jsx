import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * DevConnect — Dev Header (logged-in state)
 * Editor-chrome nav shown once a user is authenticated: tab-style
 * page links, a "+ new post" button, notification bell, and the
 * current user's chip.
 */

const NAV_TABS = [
  { key: "feed", label: "feed.js" },
  { key: "my-posts", label: "my-posts.js" },
  { key: "saved", label: "saved.js" },
  { key: "explore", label: "explore.js" },
];

export default function DevHeader({
  profile,
  user,
  activeTab,
  setTab,
  hasUnreadNotifications = false,
  onNavigate,
  onNewPost,
  onOpenNotifications,
  onOpenProfile,
  setSearchParams,
  gotoProfile
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleTabChange = (key) => {
    onNavigate?.(key);
    setTab?.(key);
    setSearchParams?.({ tab: key });
  };

  const handleProfileClick = () => {
    onOpenProfile?.();
    const myId = profile?._id || user?._id;
    if (myId) {
      if (gotoProfile) {
        gotoProfile(myId);
      } else {
        navigate(`/devProfile/${myId}`);
      }
    } else {
      navigate("/MyProfileUpdate");
    }
  };

  return (
    <div className="bg-[#23252e] border-b border-[#383a46] sticky top-0 z-10">
      {/* chrome bar */}
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-[#383a46]">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e18a8a]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#e8a87c]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#8fd19e]" />
        </div>
        <span className="ml-3.5 font-mono text-[0.78rem] text-[#5a5c6b]">
          ~/devconnect/{activeTab}.js — logged in as @{profile?.username ?? user?.userName ?? "you"}
        </span>
      </div>

      {/* nav row */}
      <nav className="flex items-center max-w-[1080px] mx-auto px-5">
        <div className="hidden md:flex flex-1">
          {NAV_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`cursor-pointer flex items-center gap-2 py-3.5 px-4 font-mono text-[0.8rem] border-r border-[#383a46] transition-colors ${activeTab === tab.key
                ? "text-[#e8e9ee] bg-[#2a2c37]"
                : "text-[#8b8d9b] hover:text-[#e8e9ee]"
                }`}
            >
              {activeTab === tab.key && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#8fd19e]" />
              )}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3 ml-auto py-3">
          <Link to="/newPostPage">
            <button
              onClick={onNewPost}
              className="px-4 py-2 font-mono text-[0.8rem] rounded border border-[#8fd19e] bg-[#8fd19e] text-[#182019] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              + new post
            </button>
          </Link>

          <button
            onClick={onOpenNotifications}
            className="relative w-[34px] h-[34px] border border-[#383a46] rounded-lg bg-[#2a2c37] flex items-center justify-center text-[#8b8d9b] hover:text-[#e8e9ee] transition-colors cursor-pointer"
            aria-label="notifications"
          >
            🔔
            {hasUnreadNotifications && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#e18a8a]" />
            )}
          </button>

          <button
            type="button"
            onClick={handleProfileClick}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 border border-[#383a46] rounded-full text-[0.8rem] text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors cursor-pointer"
          >
            {profile?.avatar ? (
              <img
                src={profile.avatar.startsWith("http") ? profile.avatar : `http://localhost:3000${profile.avatar.startsWith("/") ? "" : "/"}${profile.avatar}`}
                alt="Profile"
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#8fd19e] to-[#7eb6e0]" />
            )}

            <span>{profile?.username ?? user?.userName ?? "you"}</span>
          </button>
        </div>

        {/* mobile menu toggle */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden ml-auto py-3.5 px-4 text-[#e8e9ee] text-lg cursor-pointer"
          aria-label="menu"
        >
          ☰
        </button>
      </nav>

      {/* mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden flex flex-col border-t border-[#383a46] bg-[#23252e]">
          {NAV_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                handleTabChange(tab.key);
                setMenuOpen(false);
              }}
              className={`text-left py-3 px-5 font-mono text-[0.8rem] border-b border-[#383a46] cursor-pointer ${activeTab === tab.key ? "text-[#e8e9ee]" : "text-[#8b8d9b]"
                }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="flex gap-2.5 p-4">
            <Link to="/newPostPage" className="flex-1" onClick={() => setMenuOpen(false)}>
              <button
                type="button"
                className="w-full px-4 py-2 font-mono text-[0.8rem] rounded bg-[#8fd19e] text-[#182019] font-semibold cursor-pointer"
              >
                + new post
              </button>
            </Link>
            <button
              type="button"
              onClick={() => {
                handleProfileClick();
                setMenuOpen(false);
              }}
              className="flex-1 px-4 py-2 font-mono text-[0.8rem] rounded border border-[#383a46] text-[#8b8d9b] hover:text-[#e8e9ee] cursor-pointer"
            >
              @{profile?.username ?? user?.userName ?? "you"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
