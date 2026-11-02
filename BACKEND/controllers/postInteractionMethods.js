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

            if (!comment?.trim()) {
                return res.status(400).json({
                    message: "Comment cannot be empty"
                });
            }

            const updatedPost = await Post.findByIdAndUpdate(
                postId,
                {
                    $push: {
                        comments: {
                            author: userId,
                            comment: comment.trim(),
                            parentComment: null
                        }
                    }
                },
                { new: true }
            );

            if (!updatedPost) {
                return res.status(404).json({
                    message: "Post not found"
                });
            }

            return res.status(200).json({
                message: "Comment added successfully",
                post: updatedPost
            });
        } else if (task == 3) {
            const { postId } = req.body;
            const post = await Post.findById(postId)
                .populate("comments.author", "username avatar");

            if (!post) {
                return res.status(404).json({
                    message: "Post not found"
                });
            }

            return res.status(200).json({
                message: "Post fetched successfully",
                comments: post.comments
            });
        } else if (task == 4) {
            const { postId, commentId, replyText } = req.body;

            if (!replyText?.trim()) {
                return res.status(400).json({
                    message: "Reply cannot be empty"
                });
            }

            const post = await Post.findById(postId);

            if (!post) {
                return res.status(404).json({
                    message: "Post not found"
                });
            }

            // Find the parent comment
            const parentComment = post.comments.id(commentId);

            if (!parentComment || parentComment.parentComment) {
                return res.status(404).json({
                    message: "Parent comment not found"
                });
            }

            // Add reply to the comments array
            post.comments.push({
                author: userId,
                parentComment: commentId,
                comment: replyText.trim()
            });

            await post.save();

            await post.populate("comments.author", "username avatar");

            return res.status(200).json({
                message: "Reply added successfully",
                comments: post.comments
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Couldn't interact the post",
            error: error.message
        });
    }
};