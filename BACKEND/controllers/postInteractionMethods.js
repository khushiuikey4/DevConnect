const Post = require('../models/post');
const Dev = require('../models/dev')
exports.postInteractionMethods = async (req, res) => {
    try {
        const userId = req.session?.dev?._id;
        const task = req.body.task;
        if (!userId) {
            return res.status(401).json({
                message: "Please log in first"
            });
        }

        if (task == 0) {
            // Like the post
            const { postId, liked } = req.body;
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
        } else if (task == 1) {
            //saved the post
            const { postId, saved } = req.body;
            if (saved) {
                const updatedPost = await Dev.findOneAndUpdate(
                    { _id: userId },
                    { $addToSet: { saved: postId } },
                    { new: true }
                )
            } else {
                const updatedPost = await Dev.findOneAndUpdate(
                    { _id: userId },
                    { $pull: { saved: postId } },
                    { new: true }
                )
            }
            return res.status(200).json({
                message: "Post saved Successfully",
                post: updatedPost
            })
        } else if (task == 2) {
            const { postId, comment } = req.body;
            if (comment.length > 0) {
                const updatedPost = await Post.findOneAndUpdate(
                    { _id: postId },
                    { $addToSet: { comments: { author: userId, comment } } }
                    , { new: true }
                )
            }
            return res.status(200).json({
                message: "Comment added Successfully",
                post: updatedPost
            })
        }

    } catch (error) {
        return res.status(500).json({
            message: "Couldn't interact the post",
            error: error.message
        });
    }
};