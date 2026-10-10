
const Post = require('../models/post');

exports.getSavedPosts = async (req, res) => {
    try {
        const devId = req.session?.dev?._id;

        if (!devId) {
            return res.status(401).json({
                message: "Please log in first"
            });
        }

        console.log("Logged-in user ID:", devId);

        const mySavedPosts = await Post.find({
            savedBy: devId
        })
            .populate("author", "username avatar")
            .sort({ createdAt: -1 });

        console.log("Saved posts found:", mySavedPosts.length);

        return res.status(200).json({
            message: "Saved posts fetched successfully.",
            posts: mySavedPosts
        });

    } catch (error) {
        console.error("getSavedPosts error:", error);

        return res.status(500).json({
            message: "Failed to fetch saved posts",
            error: error.message
        });
    }
};
