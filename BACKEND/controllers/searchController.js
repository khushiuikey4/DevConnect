const Post = require('../models/post');
const Dev = require('../models/dev');
const mongoose = require('mongoose');

// How many posts/users are sent per page
const POSTS_PER_PAGE = 3;

// Helper: fetch recent published posts
const getRecentPosts = (page = 1, limit = POSTS_PER_PAGE, additionalMatch = {}, sort = { createdAt: -1, _id: -1 }) => {
    const match = { status: "published", ...additionalMatch };

    return Post.aggregate([
        { $match: match },
        {
            $addFields: {
                likesCount: { $size: { $ifNull: ["$likes", []] } }
            }
        },
        { $sort: sort },
        { $skip: (page - 1) * limit },
        { $limit: limit + 1 },
        {
            $lookup: {
                from: Dev.collection.name,
                localField: "author",
                foreignField: "_id",
                as: "author"
            }
        },
        { $unwind: { path: "$author", preserveNullAndEmptyArrays: false } },
        {
            $project: {
                author: { _id: 1, username: 1, avatar: 1 },
                title: 1,
                content: 1,
                excerpt: 1,
                tags: 1,
                likes: 1,
                savedBy: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                likesCount: 1
            }
        }
    ]);
};

// Helper: fetch recent users
const getRecentUsers = (page = 1, limit = POSTS_PER_PAGE, additionalMatch = {}, sort = { createdAt: -1, _id: -1 }) => {
    return Dev.aggregate([
        { $match: additionalMatch },
        {
            $addFields: {
                followerCount: { $size: { $ifNull: ["$followers", []] } }
            }
        },
        { $sort: sort },
        { $skip: (page - 1) * limit },
        { $limit: limit + 1 },
        {
            $project: {
                password: 0,
                email: 0
            }
        }
    ]);
};

// Helper: search posts with Atlas Search
const searchPosts = (q, page = 1, limit = POSTS_PER_PAGE, additionalMatch = {}, sort = null) => {
    const pipeline = [
        {
            $search: {
                index: "postSearch",
                compound: {
                    should: [
                        { autocomplete: { query: q, path: "title" } },
                        { autocomplete: { query: q, path: "excerpt" } },
                        { autocomplete: { query: q, path: "tags" } },
                        { autocomplete: { query: q, path: "content" } }
                    ],
                    minimumShouldMatch: 1
                }
            }
        },
        {
            $match: {
                status: "published",
                ...additionalMatch
            }
        },
        {
            $addFields: {
                score: { $meta: "searchScore" },
                likesCount: { $size: { $ifNull: ["$likes", []] } }
            }
        }
    ];

    if (sort) {
        pipeline.push({ $sort: sort });
    }

    pipeline.push(
        { $skip: (page - 1) * limit },
        { $limit: limit + 1 },
        {
            $lookup: {
                from: Dev.collection.name,
                localField: "author",
                foreignField: "_id",
                as: "author"
            }
        },
        { $unwind: { path: "$author", preserveNullAndEmptyArrays: false } },
        {
            $project: {
                author: { _id: 1, username: 1, avatar: 1 },
                title: 1,
                content: 1,
                excerpt: 1,
                tags: 1,
                likes: 1,
                savedBy: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                score: 1,
                likesCount: 1
            }
        }
    );

    return Post.aggregate(pipeline);
};

// Search own posts handler
exports.searchOwnPostsHandler = async (req, res) => {
    try {
        const devId = req.session?.dev?._id;
        if (!devId) return res.status(401).json({ message: "Please log in first" });

        const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
        const posts = q ? await searchOwnPosts(q, devId) : [];

        return res.status(200).json({ message: "Posts fetched successfully.", posts });
    } catch (error) {
        return res.status(500).json({ message: "Search failed", error: error.message });
    }
};

const searchOwnPosts = (q, userId) => {
    return Post.aggregate([
        {
            $search: {
                index: "postSearch",
                compound: {
                    should: [
                        { autocomplete: { query: q, path: "title" } },
                        { autocomplete: { query: q, path: "excerpt" } },
                        { autocomplete: { query: q, path: "tags" } },
                        { autocomplete: { query: q, path: "content" } }
                    ],
                    minimumShouldMatch: 1
                }
            }
        },
        {
            $match: {
                author: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: Dev.collection.name,
                localField: "author",
                foreignField: "_id",
                as: "author"
            }
        },
        {
            $unwind: {
                path: "$author",
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $project: {
                author: { _id: 1, username: 1, avatar: 1 },
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

exports.searchSavedPostsHandler = async (req, res) => {
    try {
        const devId = req.session?.dev?._id;
        if (!devId) return res.status(401).json({ message: "Please log in first" });

        const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
        const posts = q ? await searchOwnSavedPosts(q, devId) : [];

        return res.status(200).json({ message: "Posts fetched successfully.", posts });
    } catch (error) {
        return res.status(500).json({ message: "Search failed", error: error.message });
    }
};

const searchOwnSavedPosts = async (q, devId) => {
    const dev = await Dev.findById(devId)
        .populate({
            path: "saved",
            match: {
                $or: [
                    { title: { $regex: q, $options: "i" } },
                    { content: { $regex: q, $options: "i" } },
                    { excerpt: { $regex: q, $options: "i" } },
                    { tags: { $regex: q, $options: "i" } }
                ]
            },
            populate: {
                path: "author",
                select: "username avatar"
            }
        });

    return dev?.saved || [];
};

// Helper: search users with Atlas Search
const searchUsers = (q, page = 1, limit = POSTS_PER_PAGE, additionalMatch = {}, sort = null) => {
    const pipeline = [
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
            $addFields: {
                score: { $meta: "searchScore" },
                followerCount: { $size: { $ifNull: ["$followers", []] } }
            }
        }
    ];

    if (Object.keys(additionalMatch).length > 0) {
        pipeline.push({ $match: additionalMatch });
    }

    if (sort) {
        pipeline.push({ $sort: sort });
    }

    pipeline.push(
        { $skip: (page - 1) * limit },
        { $limit: limit + 1 },
        {
            $project: {
                password: 0,
                email: 0
            }
        }
    );

    return Dev.aggregate(pipeline);
};

// Fetch all matching posts and users
// Query params:
// - q: search query text
// - filter: "latest" | "following" | "trending" | "all"
// - type: "posts" | "users" | "all"
// - cursor / page: page number
// - limit: items per page
exports.getAll = async (req, res) => {
    try {
        const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
        const cursor = req.query.cursor || req.query.page || null;
        let page = 1;
        if (cursor) {
            const parsed = parseInt(cursor, 10);
            if (!isNaN(parsed) && parsed > 0) {
                page = parsed;
            }
        }

        const filter = typeof req.query.filter === "string" ? req.query.filter.trim().toLowerCase() : "latest";
        const type = typeof req.query.type === "string" ? req.query.type.trim().toLowerCase() : "all";
        const limit = parseInt(req.query.limit, 10) || POSTS_PER_PAGE;

        const devId = req.session?.dev?._id;
        let followingIds = [];
        if (filter === "following" && devId) {
            const currentDev = await Dev.findById(devId).select("following");
            if (currentDev?.following && Array.isArray(currentDev.following)) {
                followingIds = currentDev.following.map(id => new mongoose.Types.ObjectId(id));
            }
        }

        // If filtering by following but user is not logged in or doesn't follow anyone:
        if (filter === "following" && (!devId || followingIds.length === 0)) {
            return res.status(200).json({
                message: devId ? "You are not following anyone yet" : "Please log in to see posts from developers you follow",
                posts: [],
                users: [],
                nextCursor: null,
                hasMorePosts: false,
                hasMoreUsers: false,
                page
            });
        }

        const fetchPosts = async () => {
            if (filter === "following") {
                const match = { author: { $in: followingIds } };
                return q
                    ? searchPosts(q, page, limit, match)
                    : getRecentPosts(page, limit, match, { createdAt: -1, _id: -1 });
            } else if (filter === "trending") {
                return q
                    ? searchPosts(q, page, limit, {}, { likesCount: -1, score: -1, createdAt: -1 })
                    : getRecentPosts(page, limit, {}, { likesCount: -1, createdAt: -1, _id: -1 });
            } else {
                // latest or all
                return q
                    ? searchPosts(q, page, limit, {}, { createdAt: -1, score: -1 })
                    : getRecentPosts(page, limit, {}, { createdAt: -1, _id: -1 });
            }
        };

        const fetchUsers = async () => {
            if (filter === "following") {
                const match = { _id: { $in: followingIds } };
                return q
                    ? searchUsers(q, page, limit, match)
                    : getRecentUsers(page, limit, match, { createdAt: -1, _id: -1 });
            } else if (filter === "trending") {
                return q
                    ? searchUsers(q, page, limit, {}, { followerCount: -1, score: -1 })
                    : getRecentUsers(page, limit, {}, { followerCount: -1, _id: -1 });
            } else {
                // latest or all
                return q
                    ? searchUsers(q, page, limit)
                    : getRecentUsers(page, limit, {}, { createdAt: -1, _id: -1 });
            }
        };

        let posts = [];
        let users = [];

        if (type === "posts") {
            posts = await fetchPosts();
        } else if (type === "users") {
            users = await fetchUsers();
        } else {
            // all or unspecified (e.g. from DevFeed)
            [posts, users] = await Promise.all([fetchPosts(), fetchUsers()]);
        }

        const hasMorePosts = posts.length > limit;
        if (hasMorePosts) posts = posts.slice(0, limit);

        const hasMoreUsers = users.length > limit;
        if (hasMoreUsers) users = users.slice(0, limit);

        const hasMore = type === "users" ? hasMoreUsers : hasMorePosts;
        const nextCursor = hasMore ? String(page + 1) : null;

        return res.status(200).json({
            message: "Posts and users fetched successfully.",
            posts,
            users,
            nextCursor,
            hasMorePosts,
            hasMoreUsers,
            page
        });

    } catch (error) {
        return res.status(500).json({
            message: "Search failed",
            error: error.message
        });
    }
};

// Following filter
const getFollowing = async (usersList, postsList, req) => {
    const devId = req.session?.dev?._id;

    if (!devId) {
        const error = new Error("Please log in first");
        error.status = 401;
        throw error;
    }

    const currentDev = await Dev.findById(devId).select("following");

    if (!currentDev) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
    }

    const followingIds = (currentDev.following || []).map(
        id => id.toString()
    );

    const eligibleUserIds = usersList
        .filter(user => followingIds.includes(user._id.toString()))
        .map(user => user._id);

    const eligiblePostIds = postsList
        .filter(post => {
            const authorId = post.author?._id ?? post.author;

            return authorId &&
                followingIds.includes(authorId.toString());
        })
        .map(post => post._id);

    const [users, posts] = await Promise.all([
        Dev.find({
            _id: { $in: eligibleUserIds }
        }).select("-password -email -following -followers"),

        Post.find({
            _id: { $in: eligiblePostIds },
            status: "published"
        })
            .populate("author", "username avatar")
    ]);

    return { users, posts };
};

// Trending filter
exports.getTrending = async (usersList, postsList) => {
    const userIds = usersList.map(user => user._id);
    const postIds = postsList.map(post => post._id);

    const [users, posts] = await Promise.all([
        Dev.aggregate([
            {
                $match: {
                    _id: { $in: userIds }
                }
            },
            {
                $addFields: {
                    followerCount: {
                        $size: { $ifNull: ["$followers", []] }
                    }
                }
            },
            {
                $sort: {
                    followerCount: -1,
                    _id: 1
                }
            },
            {
                $project: {
                    password: 0,
                    email: 0,
                    following: 0,
                    followers: 0
                }
            }
        ]),

        Post.aggregate([
            {
                $match: {
                    _id: { $in: postIds },
                    status: "published"
                }
            },
            {
                $addFields: {
                    engagement: {
                        $size: { $ifNull: ["$likes", []] }
                    }
                }
            },
            {
                $sort: {
                    engagement: -1,
                    createdAt: -1
                }
            },
            {
                $lookup: {
                    from: Dev.collection.name,
                    localField: "author",
                    foreignField: "_id",
                    as: "author"
                }
            },
            {
                $unwind: {
                    path: "$author",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $project: {
                    author: { _id: 1, username: 1, avatar: 1 },
                    title: 1,
                    content: 1,
                    excerpt: 1,
                    tags: 1,
                    likes: 1,
                    savedBy: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    engagement: 1
                }
            }
        ])
    ]);

    return { users, posts };
};

// Latest filter: posts from the past 48 hours
exports.getLatest = async (usersList, postsList) => {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const posts = await Post.find({
        _id: {
            $in: postsList.map(post => post._id)
        },
        status: "published",
        createdAt: {
            $gte: cutoff
        }
    })
        .populate("author", "username avatar")
        .sort({ createdAt: -1 });

    return {
        users: usersList,
        posts
    };
};

// Lower-level keyword filter: search within the provided lists
const getLowerFiltered = (usersList, postsList, keyword) => {
    const term = keyword.toLowerCase();

    const users = usersList.filter(user =>
        [user.username, user.name, user.fullName].some(value =>
            typeof value === "string" &&
            value.toLowerCase().includes(term)
        )
    );

    const posts = postsList.filter(post =>
        [
            post.title,
            post.excerpt,
            post.content,
            ...(Array.isArray(post.tags) ? post.tags : [])
        ].some(value =>
            typeof value === "string" &&
            value.toLowerCase().includes(term)
        )
    );

    return { users, posts };
};

// Apply selected filter
exports.getFiltered = async (req, res) => {
    try {
        const { list, filter } = req.body;

        if (
            !list ||
            !Array.isArray(list.users) ||
            !Array.isArray(list.posts) ||
            typeof filter !== "string" ||
            !filter.trim()
        ) {
            return res.status(400).json({
                message: "Valid user list, post list, and filter are required"
            });
        }

        const usersList = list.users;
        const postsList = list.posts;

        let result;

        if (filter === "all") {
            result = {
                users: usersList,
                posts: postsList
            };
        } else if (filter === "following") {
            result = await getFollowing(usersList, postsList, req);
        } else if (filter === "trending") {
            result = await exports.getTrending(usersList, postsList);
        } else if (filter === "latest") {
            result = await exports.getLatest(usersList, postsList);
        } else {
            result = getLowerFiltered(
                usersList,
                postsList,
                filter.trim()
            );
        }

        return res.status(200).json({
            message: "Filtered results fetched successfully.",
            users: result.users,
            posts: result.posts
        });

    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Search failed"
        });
    }
};
