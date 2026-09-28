/**
 * DevConnect — Dev Sidebar
 * Supplementary panel shown alongside the feed: the current
 * user's activity stats, trending tags, and follow suggestions.
 *
 * Usage:
 *   import DevSidebar from "./DevSidebar";
 *   <DevContainer sidebar={<DevSidebar />}>...</DevContainer>
 */

const SAMPLE_STATS = [
  { label: "posts published", value: 3 },
  { label: "total likes", value: 61 },
  { label: "followers", value: 14 },
];

const SAMPLE_TRENDING = [
  { tag: "react", count: "1.2k" },
  { tag: "typescript", count: "1.4k" },
  { tag: "nodejs", count: "980" },
  { tag: "docker", count: "410" },
];

const SAMPLE_SUGGESTIONS = [
  {
    username: "arjun_ships",
    tagline: "next.js · postgres",
    gradient: "from-[#b39ddb] to-[#7eb6e0]",
  },
  {
    username: "codewithzee",
    tagline: "docker · devops",
    gradient: "from-[#e8a87c] to-[#8fd19e]",
  },
];

function Panel({ label, children }) {
  return (
    <div className="bg-[#23252e] border border-[#383a46] rounded-[10px] p-5">
      <div className="font-mono text-[0.8rem] text-[#5a5c6b] mb-4">
        // {label}
      </div>
      {children}
    </div>
  );
}

export default function DevSidebar({
  stats = SAMPLE_STATS,
  trending = SAMPLE_TRENDING,
  suggestions = SAMPLE_SUGGESTIONS,
  onFollow,
  onTagClick,
}) {
  return (
    <aside className="flex flex-col gap-5">
      <Panel label="your activity">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex justify-between text-[0.85rem] py-2 ${
              i !== stats.length - 1 ? "border-b border-[#383a46]" : ""
            }`}
          >
            <span className="text-[#e8e9ee]">{stat.label}</span>
            <span className="font-mono text-[#8fd19e]">{stat.value}</span>
          </div>
        ))}
      </Panel>

      <Panel label="trending tags">
        {trending.map((item) => (
          <button
            key={item.tag}
            onClick={() => onTagClick?.(item.tag)}
            className="flex justify-between w-full text-left text-[0.85rem] py-2 text-[#e8e9ee] hover:text-[#8fd19e] transition-colors"
          >
            <span>{item.tag}</span>
            <span className="font-mono text-[0.76rem] text-[#5a5c6b]">
              {item.count}
            </span>
          </button>
        ))}
      </Panel>

      <Panel label="who to follow">
        {suggestions.map((person) => (
          <div key={person.username} className="flex items-center gap-2.5 py-2">
            <span
              className={`w-[30px] h-[30px] rounded-full bg-gradient-to-br ${person.gradient} flex-shrink-0`}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[0.85rem] font-medium truncate">
                {person.username}
              </div>
              <div className="font-mono text-[0.74rem] text-[#5a5c6b] truncate">
                {person.tagline}
              </div>
            </div>
            <button
              onClick={() => onFollow?.(person.username)}
              className="font-mono text-[0.72rem] px-2.5 py-1 border border-[#383a46] rounded text-[#8b8d9b] hover:text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors flex-shrink-0"
            >
              follow
            </button>
          </div>
        ))}
      </Panel>
    </aside>
  );
}
