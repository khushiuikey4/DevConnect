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
exports.getMyPost = async (req, res) => {
    try {
        const { postId } = req.body;
        const devId = req.session?.dev?._id;

        console.log("Logged-in devId:", devId);

        if (!devId) {
            return res.status(401).json({
                message: "Please log in first"
            });
        }

        const myPost = await Post.findOne({ _id: postId, author: devId })

        return res.status(200).json({
            message: "Your post fetched successfully.",
            myPost: myPost
        });

    } catch (error) {
        console.error("getMyPost error:", error);

        return res.status(500).json({
            message: "Failed to fetch your post",
            error: error.message
        });
    }
};
exports.deleteMyPost = async (req, res) => {
    try {
        const { postId } = req.body;
        const devId = req.session?.dev?._id;
        if (devId) {
            const deletedPost = await Post.findOneAndDelete({ _id: postId, author: devId });
            return res.status(200).json({
                message: "post deleted successfully",
                deletedPost
            })
        } else {
            return res.status(401).json({ message: "Please log in first" });
        }
    } catch (error) {
        return res.status(400).json({
            message: "Unable to delete your post",
            error: error.message
        })
    }
}
exports.editMyPost = async (req, res) => {
    try {
        const { postId, title, excerpt, content, tags, status } = req.body;
        const devId = req.session?.dev?._id;
        if (devId) {
            const updatedPost = await Post.findOneAndUpdate({ _id: postId, author: devId }, { title, excerpt, content, tags, status }, { new: true, runValidators: true })
            return res.status(200).json({
                message: "Post edited successfully.",
                updatedPost
            })
        } else {
            return res.status(401).json({ message: "Please log in first" })
        }
    } catch (err) {
        return res.status(400).json({
            message: "Unable to edit your post",
            error: err.message
        })
    }
}