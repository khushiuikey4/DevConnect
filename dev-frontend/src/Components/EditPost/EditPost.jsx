import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { editPostToServer, getMyPostFromServer } from "../../services/myPosts"
const TITLE_MAX = 100; // postSchema.title maxlength
const EXCERPT_MAX = 160; // postSchema.excerpt maxlength

function ToolbarButton({ label, children, onClick }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            className="w-10 h-10 flex items-center justify-center rounded-md border border-[#383a46] text-[#8b8d9b] font-mono text-[0.8rem] hover:text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors"
        >
            {children}
        </button>
    );
}

export default function EditPost({ tab, setTab }) {
    // TODO: replace these initial values with the post you fetch by postId
    const { postId } = useParams();
    const [post, setPost] = useState({});
    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await getMyPostFromServer(postId);
                if (response.myPost) {
                    const fetched = response.myPost;
                    setPost(fetched);
                    setTitle(fetched.title || "");
                    setExcerpt(fetched.excerpt || "");
                    setContent(fetched.content || "");
                    setTags(fetched.tags || []);
                }
            } catch (error) {
                console.error("Failed to load post:", error);
            }
        };
        fetchPost();
    }, [postId]);

    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const readMinutes = Math.ceil(wordCount / 200);
    const addTag = () => {
        const value = tagInput.trim().toLowerCase();
        if (!value || tags.includes(value)) return;
        setTags([...tags, value]);
        setTagInput("");
    };

    const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));
    const handleEditPostToServer = async (status) => {
        const response = await editPostToServer({ postId, title, excerpt, content, tags, status });
        if (response.updatedPost) {
            setTab('my-posts')
            navigate('/devHomePage');
        } else {
            console.log('unable to edit/update post(msg from frontend)')
        }

    }

    return (
        <div className="min-h-screen bg-[#1e1f26] text-[#e8e9ee]">
            {/* top bar */}
            <header className="flex items-center justify-between px-6 py-[22px] border-b border-[#383a46]">
                <div className="flex items-center gap-4 font-mono text-[0.8rem]">
                    <div className="flex gap-2" aria-hidden="true">
                        <span className="w-3.5 h-3.5 rounded-full bg-[#e18a8a]" />
                        <span className="w-3.5 h-3.5 rounded-full bg-[#e8a87c]" />
                        <span className="w-3.5 h-3.5 rounded-full bg-[#8fd19e]" />
                    </div>
                    <span className="text-[#5a5c6b]">
                        ~/devconnect/{" "}
                        <span className="text-[#c9cad3]">edit-post.md</span>
                    </span>
                </div>

                <button
                    type="button"
                    // TODO: navigate back to /my-posts
                    onClick={() => {
                        setTab('my-posts')
                        navigate('/devHomePage')
                    }}
                    className="font-mono text-[0.8rem] px-4 py-2.5 rounded-md border border-[#383a46] text-[#8b8d9b] hover:text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors"
                >
                    ← back
                </button>
            </header>

            <main className="max-w-[1005px] mx-auto px-6 pt-14 pb-20">
                {/* title */}
                <input
                    type="text"
                    value={title}
                    maxLength={TITLE_MAX}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Post title..."
                    aria-label="Post title"
                    className="w-full bg-transparent outline-none text-[2.4rem] font-bold tracking-[-0.01em] text-[#e8e9ee] placeholder:text-[#5a5c6b] mb-5"
                />

                {/* excerpt */}
                <input
                    type="text"
                    value={excerpt}
                    maxLength={EXCERPT_MAX}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="One-line excerpt (optional – shown on the feed card)"
                    aria-label="Excerpt"
                    className="w-full bg-transparent outline-none italic text-[1.1rem] text-[#8b8d9b] placeholder:text-[#5a5c6b] mb-9"
                />

                {/* toolbar */}
                <div className="flex items-center justify-between pb-5 border-b border-[#383a46]">
                    <div className="flex gap-2">
                        {/* TODO: reuse the same formatting handlers as your new post page */}
                        <ToolbarButton label="Bold">
                            <b>B</b>
                        </ToolbarButton>
                        <ToolbarButton label="Italic">
                            <i>I</i>
                        </ToolbarButton>
                        <ToolbarButton label="Code">{"{ }"}</ToolbarButton>
                        <ToolbarButton label="Link">
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
                                <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
                            </svg>
                        </ToolbarButton>
                        <ToolbarButton label="Quote">“</ToolbarButton>
                        <ToolbarButton label="List">•</ToolbarButton>
                    </div>

                    <span className="font-mono text-[0.76rem] text-[#5a5c6b]">
                        {wordCount} words · {readMinutes < 1 ? "<1" : readMinutes} min read
                    </span>
                </div>

                {/* content */}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={
                        "Write in markdown...\n\n## What you’ll learn\nStart with a heading, then tell the story – what you built, what broke, what you’d do differently."
                    }
                    aria-label="Post content"
                    className="w-full min-h-[420px] bg-transparent outline-none resize-y font-mono text-[0.9rem] leading-[1.85] text-[#e8e9ee] placeholder:text-[#5a5c6b] pt-5 mb-10"
                />

                {/* tags */}
                <section className="bg-[#23252e] border border-[#383a46] rounded-xl p-6 mb-5">
                    <h2 className="font-mono text-[0.85rem] font-normal text-[#8fd19e] mb-5">
            // tags
                    </h2>

                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2.5 mb-4">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-2 font-mono text-[0.78rem] text-[#8fd19e] bg-[#8fd19e1a] px-3 py-1.5 rounded-md"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        aria-label={`remove tag ${tag}`}
                                        className="text-[#8b8d9b] hover:text-[#e18a8a] transition-colors leading-none"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2.5">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addTag();
                                }
                            }}
                            placeholder="add a tag..."
                            aria-label="Add a tag"
                            className="flex-1 min-w-0 bg-[#2a2c36] border border-[#383a46] rounded-md px-4 py-3 font-mono text-[0.85rem] text-[#e8e9ee] placeholder:text-[#5a5c6b] outline-none focus:border-[#8fd19e] transition-colors disabled:opacity-50"
                        />
                        <button
                            type="button"
                            onClick={addTag}
                            className="font-mono text-[0.85rem] px-5 py-3 rounded-md border border-[#383a46] bg-[#2a2c36] text-[#8b8d9b] hover:text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors disabled:opacity-50"
                        >
                            add
                        </button>
                    </div>

                </section>

                {/* actions */}
                <section className="bg-[#23252e] border border-[#383a46] rounded-xl p-6">
                    <h2 className="font-mono text-[0.85rem] font-normal text-[#8fd19e] mb-5">
            // update
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"

                            // TODO: call your update function with { title, excerpt, content, tags, status: "published" }
                            onClick={() => {
                                handleEditPostToServer("published")
                            }}
                            className="sm:flex-[1.4] font-mono text-[0.9rem] font-semibold px-5 py-4 rounded-lg bg-[#8fd19e] text-[#1e1f26] hover:bg-[#a3dfb0] transition-colors"
                        >
                            {post.status === "published" ? "Update post" : "Create new post"}
                        </button>

                        <button
                            type="button"
                            // TODO: call your update function with { ..., status: "draft" }
                            onClick={() => {
                                handleEditPostToServer("draft")
                            }}
                            className="sm:flex-1 font-mono text-[0.85rem] px-5 py-4 rounded-lg border border-[#383a46] text-[#8b8d9b] hover:text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors"
                        >
                            save as draft
                        </button>

                        <button
                            type="button"
                            // TODO: navigate back to /my-posts
                            onClick={() => {
                                setTab('my-posts')
                                navigate('/devHomePage')
                            }}
                            className="sm:flex-none font-mono text-[0.85rem] px-6 py-4 rounded-lg border border-[#383a46] text-[#8b8d9b] hover:text-[#e18a8a] hover:border-[#e18a8a] transition-colors"
                        >
                            cancel
                        </button>
                    </div>

                    <p className="text-[0.76rem] text-[#5a5c6b] mt-4">
                        drafts are only visible to you
                    </p>
                </section>
            </main>
        </div>
    );
}