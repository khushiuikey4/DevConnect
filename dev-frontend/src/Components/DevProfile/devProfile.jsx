import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { followToggleOnServer, getOtherUserProfileFromServer } from "../../services/UserProfile";
import { getCurrentDevFromServer } from "../../services/currentDev";

const SOCIAL_LABELS = {
    github: "github",
    twitter: "x / twitter",
    linkedin: "linkedin",
};

export default function DevProfile({
    profile: initialProfile,
    posts: initialPosts = [],
    currentUser: initialCurrentUser,
    onPostClick
}) {
    const navigate = useNavigate();
    const { userId: routeUserId } = useParams();

    const [currentUser, setCurrentUser] = useState(initialCurrentUser || null);
    const [profile, setProfile] = useState(
        initialProfile && Object.keys(initialProfile).length > 0 ? initialProfile : null
    );
    const [posts, setPosts] = useState(initialPosts || []);
    const [loading, setLoading] = useState(!profile && !!routeUserId);

    // Fetch current user if not provided
    useEffect(() => {
        if (!currentUser) {
            async function fetchCurrent() {
                try {
                    const result = await getCurrentDevFromServer();
                    if (result?.currentDev) {
                        setCurrentUser(result.currentDev);
                    }
                } catch (e) {
                    console.error("Failed to fetch current user in DevProfile:", e);
                }
            }
            fetchCurrent();
        }
    }, [currentUser]);

    // Fetch profile and posts if route param exists or if initialProfile was not loaded
    useEffect(() => {
        const targetId = routeUserId || initialProfile?._id || currentUser?._id;
        if (!targetId) return;

        // If we already have the profile matching targetId and it's not a different route param
        if (profile?._id === targetId && posts.length > 0) return;

        async function fetchTargetProfile() {
            setLoading(true);
            try {
                const data = await getOtherUserProfileFromServer(targetId);
                if (data?.devInformation) {
                    setProfile(data.devInformation);
                    setPosts(data.devPosts || []);
                }
            } catch (err) {
                console.error("Failed to fetch profile in DevProfile:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchTargetProfile();
    }, [routeUserId, initialProfile?._id, currentUser?._id]);

    const currentUserId = currentUser?._id;
    const isOwnProfile = profile?._id && currentUserId && String(profile._id) === String(currentUserId);

    const followers = profile?.followers || [];
    const following = profile?.following || [];

    const [isFollowing, setIsFollowing] = useState(
        followers.some(id => String(id) === String(currentUserId))
    );

    useEffect(() => {
        setIsFollowing(followers.some(id => String(id) === String(currentUserId)));
    }, [profile?._id, currentUserId]);

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
    };

    const onFollow = async () => {
        try {
            await followToggleOnServer(currentUserId, profile._id, !isFollowing);
            setIsFollowing(prev => !prev);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1e1f26] text-[#8b8d9b] flex items-center justify-center font-mono text-sm">
                // loading developer profile...
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#1e1f26] text-[#8b8d9b] flex flex-col items-center justify-center gap-4 font-mono text-sm">
                <p>// profile not found</p>
                <button
                    onClick={() => navigate('/devHomePage')}
                    className="px-4 py-2 bg-[#8fd19e] text-[#182019] rounded-md font-semibold cursor-pointer"
                >
                    Back to feed
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1e1f26] text-[#e8e9ee]">
            <main className="max-w-[880px] mx-auto px-6 pt-9 pb-[72px] flex flex-col gap-4">

                <div className="flex items-center justify-between font-mono text-[0.82rem] text-[#8b8d9b]">
                    <div>
                        // <span className="text-[#8fd19e]">{isOwnProfile ? "your profile" : "public profile"}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="hover:text-[#8fd19e] transition-colors cursor-pointer"
                    >
                        ← back
                    </button>
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

                            {profile.createdAt && (
                                <span>
                                    Joined{" "}
                                    {new Date(profile.createdAt).toLocaleDateString("en-US", {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </span>
                            )}
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
                            onClick={onEditProfile}
                            className="min-h-[44px] px-7 rounded-md border border-[#383a46] text-[#c9cad3] font-mono text-[0.88rem] font-semibold hover:border-[#8b8d9b] transition-colors cursor-pointer"
                        >
                            edit profile
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onFollow}
                            className={`min-h-[44px] px-7 rounded-md border font-mono text-[0.88rem] font-semibold transition-opacity cursor-pointer ${isFollowing
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
                            onClick={() => {
                                if (onPostClick) {
                                    onPostClick(post._id);
                                } else {
                                    navigate(`/post/${post._id}`, { state: { post } });
                                }
                            }}
                            className="flex flex-col gap-2.5 bg-[#23252e] border border-[#383a46] rounded-[10px] px-[22px] py-5 hover:border-[#4a4d5c] transition-colors cursor-pointer"
                        >
                            <div className="font-mono text-[0.78rem] text-[#8b8d9b]">
                                {new Date(post.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </div>

                            <h3 className="m-0 text-[1.1rem] font-semibold leading-[1.35] text-[#e8e9ee] hover:text-[#8fd19e] transition-colors">
                                {post.title}
                            </h3>

                            <p className="m-0 text-[0.9rem] leading-[1.6] text-[#a3a5b3]">
                                {post.excerpt || post.content?.slice(0, 160)}
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
