import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { followToggleOnServer } from "../../services/UserProfile"
const SOCIAL_LABELS = {
    github: "github",
    twitter: "x / twitter",
    linkedin: "linkedin",
};

export default function DevProfile({
    profile,
    posts = [],
    currentUser,
    onPostClick
}) {
    console.log(currentUser)
    const currentUserId = currentUser?._id;
    if (!profile) {
        return <p className="text-center text-[#8b8d9b]">Loading profile...</p>;
    }
    console.log(currentUserId)

    const followers = profile.followers || [];
    const following = profile.following || [];
    const navigate = useNavigate();

    const isOwnProfile =
        String(profile._id) === String(currentUserId);

    const [isFollowing, setIsFollowing] = useState(followers.some(
        id => String(id) === String(currentUserId)
    ))

    const tagCounts = {};

    posts.forEach((post) =>
        (post.tags || []).forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        })
    );

    const stats = [
        { label: "posts", value: posts.length },
        {
            label: "likes received",
            value: posts.reduce(
                (total, post) => total + (post.likes?.length || 0),
                0
            ),
        },
        { label: "followers", value: followers.length },
        { label: "following", value: following.length },
    ];
    const onEditProfile = () => {
        navigate('/MyProfileUpdate');
    }
    const onFollow = async () => {
        try {
            const response = await followToggleOnServer(currentUserId, profile._id, !isFollowing);
            setIsFollowing(prev => !prev);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-[#1e1f26] text-[#e8e9ee]">
            <main className="max-w-[880px] mx-auto px-6 pt-9 pb-[72px] flex flex-col gap-4">

                <div className="font-mono text-[0.82rem] text-[#8b8d9b]">
                    // <span className="text-[#8fd19e]">public profile</span>
                </div>

                <section className="flex flex-wrap items-start gap-6 bg-[#23252e] border border-[#383a46] rounded-xl p-7">

                    {profile.avatar ? (
                        <img
                            src={
                                profile.avatar.startsWith("http")
                                    ? profile.avatar
                                    : `http://localhost:3000/${profile.avatar.replace(/^\/+/, "")}`
                            }
                            alt={profile.username}
                            className="w-24 h-24 rounded-full object-cover shrink-0"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-br from-[#8fd19e] to-[#7eb6e0] font-mono text-[2.5rem] font-semibold text-[#182019]">
                            {profile.username?.[0]?.toUpperCase() || "U"}
                        </div>
                    )}

                    <div className="flex-1 basis-[300px] flex flex-col gap-3">

                        <h1 className="m-0 font-mono text-[1.75rem] font-semibold tracking-[-0.01em]">
                            {profile.username}
                        </h1>

                        {profile.bio && (
                            <p className="m-0 max-w-[520px] text-base leading-[1.6] text-[#c9cad3]">
                                {profile.bio}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.82rem] text-[#8b8d9b]">

                            {profile.location && <span>{profile.location}</span>}

                            {profile.website && (
                                <a
                                    href={
                                        /^https?:\/\//i.test(profile.website)
                                            ? profile.website
                                            : `https://${profile.website}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#8fd19e] hover:underline"
                                >
                                    {profile.website.replace(/^https?:\/\//, "")}
                                </a>
                            )}

                            <span>
                                Joined{" "}
                                {new Date(profile.createdAt).toLocaleDateString("en-US", {
                                    month: "long",
                                    year: "numeric",
                                })}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2 font-mono text-[0.82rem]">
                            {Object.entries(SOCIAL_LABELS).map(([key, label]) =>
                                profile.socialLinks?.[key] ? (
                                    <a
                                        key={key}
                                        href={profile.socialLinks[key]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center min-h-[44px] px-4 border border-[#383a46] rounded-md text-[#c9cad3] hover:text-[#8fd19e]"
                                    >
                                        {label}
                                    </a>
                                ) : null
                            )}
                        </div>
                    </div>

                    {isOwnProfile ? (
                        <button
                            type="button"
                            onClick={() => onEditProfile?.()}
                            className="min-h-[44px] px-7 rounded-md border border-[#383a46] text-[#c9cad3] font-mono text-[0.88rem] font-semibold hover:border-[#8b8d9b] transition-colors"
                        >
                            edit profile
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => onFollow?.()}
                            className={`min-h-[44px] px-7 rounded-md border font-mono text-[0.88rem] font-semibold transition-opacity ${isFollowing
                                ? "border-[#383a46] text-[#c9cad3] hover:border-[#8b8d9b]"
                                : "border-[#8fd19e] bg-[#8fd19e] text-[#182019] hover:opacity-90"
                                }`}
                        >
                            {isFollowing ? "following" : "follow"}
                        </button>
                    )}
                </section>

                <section className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#383a46] border border-[#383a46] rounded-xl overflow-hidden">

                    {stats.map(({ label, value }) => (
                        <div key={label} className="bg-[#23252e] px-5 py-[18px]">
                            <div className="font-mono text-[1.6rem] font-semibold">
                                {value}
                            </div>
                            <div className="mt-1 font-mono text-[0.78rem] text-[#8b8d9b]">
                                {label}
                            </div>
                        </div>
                    ))}
                </section>

                {posts.length > 0 && (
                    <section className="flex flex-col gap-3.5 bg-[#23252e] border border-[#383a46] rounded-xl px-6 py-5">

                        <div className="font-mono text-[0.82rem] text-[#8fd19e]">
                            // writes about
                        </div>

                        <div className="flex flex-wrap gap-2 font-mono text-[0.82rem]">
                            {Object.entries(tagCounts)
                                .sort((a, b) => b[1] - a[1])
                                .map(([tag, count]) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#8fd19e1a] text-[#8fd19e]"
                                    >
                                        {tag}
                                        <span className="text-[#8b8d9b]">{count}</span>
                                    </span>
                                ))}
                        </div>
                    </section>
                )}

                <div className="mt-3 font-mono text-[0.82rem] text-[#8fd19e]">
                    // published posts
                </div>

                {posts.length === 0 ? (
                    <p className="m-0 py-10 text-center text-[0.9rem] text-[#8b8d9b] border border-dashed border-[#383a46] rounded-[10px]">
                        No published posts yet.
                    </p>
                ) : (
                    posts.map((post) => (
                        <article
                            key={post._id}
                            className="flex flex-col gap-2.5 bg-[#23252e] border border-[#383a46] rounded-[10px] px-[22px] py-5"
                        >
                            <div className="font-mono text-[0.78rem] text-[#8b8d9b]">
                                {new Date(post.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </div>

                            <h3 className="m-0 text-[1.1rem] font-semibold leading-[1.35]">
                                <button
                                    type="button"
                                    onClick={() => onPostClick?.(post._id)}
                                    className="text-left hover:text-[#8fd19e] transition-colors"
                                >
                                    {post.title}
                                </button>
                            </h3>

                            <p className="m-0 text-[0.9rem] leading-[1.6] text-[#a3a5b3]">
                                {post.excerpt || post.content.slice(0, 160)}
                            </p>

                            <div className="flex flex-wrap items-center justify-between gap-2.5 mt-1">

                                <div className="flex flex-wrap gap-2">
                                    {(post.tags || []).map((tag) => (
                                        <span
                                            key={tag}
                                            className="font-mono text-[0.75rem] px-2.5 py-[3px] rounded bg-[#8fd19e1a] text-[#8fd19e]"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <span className="font-mono text-[0.78rem] text-[#8b8d9b]">
                                    {post.likes?.length || 0} likes
                                </span>
                            </div>
                        </article>
                    ))
                )}
            </main>
        </div>
    );
}
