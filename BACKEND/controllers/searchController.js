
const Post = require('../models/post');
const Dev = require('../models/dev');

// Default feed when there is no search text
const getRecentPosts = () => {
    return Post.aggregate([
        { $match: { status: "published" } },
        { $sort: { createdAt: -1 } },
        { $limit: 20 },
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
                updatedAt: 1
            }
        }
    ]);
};

const getRecentUsers = () => {
    return Dev.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 20 },
        { $project: { password: 0, email: 0, following: 0, followers: 0 } }
    ]);
};
// Initial post search
const searchPosts = (q) => {
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
                status: "published"
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


// Initial user search
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
            $addFields: { score: { $meta: "searchScore" } }
        },
        {
            $project: {
                password: 0,
                email: 0,
                following: 0,
                followers: 0
            }
        }
    ]);
};


// Fetch all matching posts and users
exports.getAll = async (req, res) => {
    try {
        const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

        const [posts, users] = q
            ? await Promise.all([searchPosts(q), searchUsers(q)])
            : await Promise.all([getRecentPosts(), getRecentUsers()]);

        return res.status(200).json({
            message: "Posts and users fetched successfully.",
            posts,
            users
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
            .populate("author", "username profilePicture")
    ]);

    return { users, posts };
};


// Trending filter
const getTrending = async (usersList, postsList) => {
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
const getLatest = async (usersList, postsList) => {
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
        .populate("author", "username profilePicture")
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
            result = await getTrending(usersList, postsList);
        } else if (filter === "latest") {
            result = await getLatest(usersList, postsList);
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


// exports.getPosts = async (req, res) => {
//     try {
//         const { q } = req.query;
//         if (!q) return res.status(400).json({ message: "Search query required" });

//         const posts = await searchPosts(q);
//         return res.status(200).json({ message: "Posts fetched successfully.", posts });
//     } catch (error) {
//         return res.status(500).json({ message: "Search failed", error: error.message });
//     }
// };


// exports.getPeople = async (req, res) => {
//     try {
//         const { q } = req.query;
//         if (!q) return res.status(400).json({ message: "Search query required" });

//         const users = await searchUsers(q);
//         return res.status(200).json({ message: "Users fetched successfully.", users });
//     } catch (error) {
//         return res.status(500).json({ message: "Search failed", error: error.message });
//     }
// };
