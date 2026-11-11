const Dev = require('../models/dev');

exports.getSavedPosts = async (req, res) => {
    try {
        const devId = req.session?.dev?._id;

        if (!devId) {
            return res.status(401).json({
                message: "Please log in first"
            });
        }

        const dev = await Dev.findById(devId)
            .populate({
                path: "saved",
                populate: {
                    path: "author",
                    select: "username avatar"
                }
            });

        if (!dev) {
            return res.status(404).json({
                message: "Developer not found"
            });
        }

        return res.status(200).json({
            message: "Saved posts fetched successfully.",
            posts: dev.saved
        });

    } catch (error) {
        console.error("getSavedPosts error:", error);

        return res.status(500).json({
            message: "Failed to fetch saved posts",
            error: error.message
        });
    }
};