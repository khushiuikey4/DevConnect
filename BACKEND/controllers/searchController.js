const Post = require('../models/post')
const Dev = require('../models/dev')
const searchPosts = (q) => {
    return Post.aggregate([
        {
            $search: {
                index: "postSearch",
                compound: {
                    should: [
                        {
                            autocomplete: {
                                query: q,
                                path: "title"
                            }
                        },
                        {
                            autocomplete: {
                                query: q,
                                path: "excerpt"
                            }
                        },
                        {
                            autocomplete: {
                                query: q,
                                path: "tags"
                            }
                        },
                        {
                            autocomplete: {
                                query: q,
                                path: "content"
                            }
                        }
                    ],
                    minimumShouldMatch: 1
                }
            }
        },
        {
            $match: {
                status: "published"
            }
        },
        {
            $project: {
                author: 1,
                title: 1,
                content: 1,
                excerpt: 1,
                tags: 1,
                likes: 1,
                savedBy: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                score: { $meta: "searchScore" }
            }
        }
    ]);
};
const searchUsers = (q) => {
    return Dev.aggregate([
        {
            $search: {
                index: "devSearch",
                autocomplete: {
                    query: q,
                    path: "username"
                }
            }
        },
        {
            $project: {
                password: 0,
                score: { $meta: "searchScore" }
            }
        }
    ]);
};

exports.getAll = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: "Search query required" });

        const [posts, users] = await Promise.all([searchPosts(q), searchUsers(q)]);

        return res.status(200).json({
            message: "Posts and users fetched successfully.",
            posts,
            users,
        });
    } catch (error) {
        return res.status(500).json({ message: "Search failed", error: error.message });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: "Search query required" });

        const posts = await searchPosts(q);
        return res.status(200).json({ message: "Posts fetched successfully.", posts });
    } catch (error) {
        return res.status(500).json({ message: "Search failed", error: error.message });
    }
};

exports.getPeople = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: "Search query required" });

        const users = await searchUsers(q);
        return res.status(200).json({ message: "Users fetched successfully.", users });
    } catch (error) {
        return res.status(500).json({ message: "Search failed", error: error.message });
    }
};