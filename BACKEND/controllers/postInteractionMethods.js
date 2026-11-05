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
            let updatedPost;
            if (liked) {
                updatedPost = await Post.findOneAndUpdate(
                    { _id: postId },
                    { $addToSet: { likes: userId } },
                    { new: true }
                );
            } else {
                updatedPost = await Post.findOneAndUpdate(
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
            let updatedPost;
            const { postId, saved } = req.body;
            if (saved) {
                updatedPost = await Dev.findOneAndUpdate(
                    { _id: userId },
                    { $addToSet: { saved: postId } },
                    { new: true }
                )
            } else {
                updatedPost = await Dev.findOneAndUpdate(
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

            if (!parentComment) {
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
        } else if (task == 5) {
            const { postId, commentId, editedCommentText } = req.body;

            const updatedPost = await Post.findOneAndUpdate(
                {
                    _id: postId,
                    "comments._id": commentId
                },
                {
                    $set: {
                        "comments.$.comment": editedCommentText
                    }
                },
                { new: true }
            );

            if (!updatedPost) {
                return res.status(404).json({
                    message: "Couldn't find the comment to update."
                });
            }

            return res.status(200).json({
                message: "Comment updated successfully",
                comments: updatedPost.comments
            });

        } else if (task == 6) {
            const { postId, commentId } = req.body;

            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }

            const target = post.comments.id(commentId);
            if (!target) {
                return res.status(404).json({ message: "Couldn't find the comment to delete." });
            }

            // only the comment's own author can delete it
            if (target.author.toString() !== userId.toString()) {
                return res.status(403).json({ message: "You can only delete your own comments." });
            }

            // collect the comment and every reply below it, at any depth
            const doomed = new Set([commentId.toString()]);
            let found = true;
            while (found) {
                found = false;
                post.comments.forEach((c) => {
                    const parent = c.parentComment?.toString();
                    if (parent && doomed.has(parent) && !doomed.has(c._id.toString())) {
                        doomed.add(c._id.toString());
                        found = true;
                    }
                });
            }

            const idsToDelete = post.comments
                .filter((c) => doomed.has(c._id.toString()))
                .map((c) => c._id);

            const updatedPost = await Post.findByIdAndUpdate(
                postId,
                { $pull: { comments: { _id: { $in: idsToDelete } } } },
                { new: true }
            ).populate("comments.author", "username avatar");

            return res.status(200).json({
                message: "Comment deleted successfully",
                comments: updatedPost.comments
            });
        } else if (task == 7) {
            const { postId, commentId, isLiked } = req.body;

            const updateOperation = isLiked
                ? {
                    $addToSet: {
                        "comments.$.likes": userId
                    }
                }
                : {
                    $pull: {
                        "comments.$.likes": userId
                    }
                };

            const updatedPost = await Post.findOneAndUpdate(
                {
                    _id: postId,
                    "comments._id": commentId
                },
                updateOperation,
                { new: true }
            );

            if (!updatedPost) {
                return res.status(404).json({
                    message: "Post or comment not found"
                });
            }

            const updatedComment = updatedPost.comments.id(commentId);

            return res.status(200).json({
                message: isLiked
                    ? "Comment liked successfully"
                    : "Comment disliked successfully",
                comment: updatedComment
            });
        } else if (task == 8) {
            const { postId } = req.body;
            const freshPost = Post.findById(postId);
            if (!freshPost) {
                return res.status(404).json({
                    message: "Fresh post not found"
                })
            }
            return res.status(200).json({
                message: "FreshPost fetched successfully",
                freshPost: freshPost
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: "Couldn't interact the post",
            error: error.message
        });
    }
};