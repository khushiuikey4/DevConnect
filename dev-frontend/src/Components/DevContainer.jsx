/**
 * DevConnect — Dev Container
 * The missing wrapper: provides the dark background, renders
 * DevHeader, and centers page content (like DevFeed) inside a
 * max-width container. Wrap any logged-in page's content with
 * this instead of rendering DevFeed (or similar) on its own.
 *
 * Usage:
 *   import DevContainer from "./DevContainer";
 *   import DevFeed from "./DevFeed";
 *
 *   <DevContainer activeTab="feed" user={{ username: "you" }}>
 *     <DevFeed />
 *   </DevContainer>
 *
 * Once DevSidebar exists, pass it as `sidebar` and this switches
 * to a two-column layout automatically.
 */

import DevFeed from "./DevFeed";
import DevHeader from "./DevHeader";
import DevSidebar from "./DevSidebar";

export default function DevContainer({
  children,
  sidebar,
  user,
  activeTab = "feed",
  hasUnreadNotifications = false,
  onNavigate,
  onNewPost,
  onOpenNotifications,
  onOpenProfile,
}) {
  return (
    <div className="min-h-screen bg-[#1e1f26] text-[#e8e9ee]">

      <main
        className={`max-w-[1080px] mx-auto px-7 py-9 ${sidebar ? "grid grid-cols-1 md:grid-cols-[1fr_300px] gap-10" : ""
          }`}
      >
        <DevFeed></DevFeed>
      </main>
    </div>
  );
}
