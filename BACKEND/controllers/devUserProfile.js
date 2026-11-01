const Dev = require('../models/dev')
const Post = require('../models/post')
exports.getDevUserProfile = async (req, res) => {
    const userId = req.params.userId;
    try {
        const devId = req.session?.dev?._id;

        console.log("Logged-in devId:", devId);

        if (!devId) {
            return res.status(401).json({
                message: "Please log in first"
            });
        }

        const devInformation = await Dev.findOne({ _id: userId }).select("-password");
        const devPosts = await Post.find({ author: userId })
        console.log("Dev Profile found:", devInformation);

        return res.status(200).json({
            message: "Dev User Fetched Successfully.",
            devInformation: devInformation,
            devPosts: devPosts
        });

    } catch (error) {
        console.error("getDevProfile Error:", error);

        return res.status(500).json({
            message: "Failed to fetch Dev User Profile Information.",
            error: error.message
        });
    }
}