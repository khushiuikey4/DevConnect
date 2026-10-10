const Post = require('../models/post');
const Dev = require('../models/dev');

exports.getMyPosts = async (req, res) => {
    try {
        const devId = req.session?.dev?._id;

        console.log("Logged-in devId:", devId);

        if (!devId) {
            return res.status(401).json({
                message: "Please log in first"
            });
        }

        const myPosts = await Post.find({ author: devId })
            .populate("author", "username avatar")
            .sort({ createdAt: -1 });

        console.log("Posts found:", myPosts.length);

        return res.status(200).json({
            message: "Your posts fetched successfully.",
            posts: myPosts
        });

    } catch (error) {
        console.error("getMyPosts error:", error);

        return res.status(500).json({
            message: "Failed to fetch your posts",
            error: error.message
        });
    }
};