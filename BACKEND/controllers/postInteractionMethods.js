const Post = require('../models/post');

exports.postInteractionMethods = async (req, res) => {
    try {
        const { postId, task, liked } = req.body;
        const userId = req.session?.dev?._id;

        if (!userId) {
            return res.status(401).json({
                message: "Please log in first"
            });
        }

        if (task == 0) {
            // Like the post
            if (liked) {
                const updatedPost = await Post.findOneAndUpdate(
                    { _id: postId },
                    { $addToSet: { likes: userId } },
                    { new: true }
                );
            } else {
                const updatedPost = await Post.findOneAndUpdate(
                    { _id: postId },
                    { $pull: { likes: userId } },
                    { new: true }
                );
            }

            if (!updatedPost) {
                return res.status(404).json({
                    message: "Post not found"
                });
            }

            return res.status(200).json({
                message: "Post liked successfully",
                post: updatedPost
            });
        }

    } catch (error) {
        return res.status(500).json({
            message: "Couldn't like the post",
            error: error.message
        });
    }
};