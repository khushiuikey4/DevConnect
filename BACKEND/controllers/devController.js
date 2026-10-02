const Dev = require("../models/dev");
const Post = require("../models/post");
//to check validity of the user (whether the user is logged in or not)
exports.checkUserValidity = (req, res) => {
    if (req.session.isLoggedIn === true) {
        return res.status(200).json({
            message: "user is logged in and can view the home page"
        })
    }
    return res.status(400).json({
        message: "user is not logged in."
    })
}

//to create a new post and save it into the dataBase
exports.postNewPost = async (req, res) => {
    try {
        // const response = this.checkUserValidity(req, res);
        // if (!response.ok) return response;
        const postData = req.body;
        const post = new Post({ author: postData.author, title: postData.title, content: postData.content, excerpt: postData.excerpt, tags: postData.tags, likes: postData.likes, savedBy: postData.savedBy, savedAs: postData.savedAs });
        try {
            const savedPost = await post.save();
            return res.status(200).json({
                message: "post saved successfully.",
                savedPost: savedPost
            })
        } catch (error) {
            res.status(400).json({
                message: error.message
            })
        }

    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
}

//to edit a post
exports.postEditPost = async (req, res) => {
    try {
        // const response = this.checkUserValidity(req, res);
        // if (!response.ok) return response;
        const id = req.params.id;
        const newPostData = req.body;
        const updatedPost = await Post.findByIdAndUpdate(id, newPostData, {
            new: true,
            runValidators: true
        })
        if (!updatedPost) {
            return res.status(400).json({
                message: "post not found"
            })
        }
        return res.status(200).json({
            message: "post updated successfully",
            post: updatedPost
        })
    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
}
//to delete a post
exports.deletePost = async (req, res) => {
    try {
        // const response = this.checkUserValidity(req, res);
        // if (!response.ok) return response;
        const id = req.params.id;
        const deletedPost = await Post.findByIdAndDelete(id);
        if (!deletedPost) {
            return res.status(400).json({
                message: "Could not find the post to delete."
            })
        }
        return res.status(200).json({
            message: "post deleted successfully.",
            post: deletedPost
        })
    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
}

//fetch all posts
exports.getAllPosts = async (req, res) => {
    try {
        let postList = [];
        try {
            postList = await Post.find();
        }
        catch (error) {
            return res.status(400).json({
                message: "Error in fetching all posts.",
                error: error
            })
        }
        return res.status(200).json({
            postList: postList
        })

    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
}

//fetch all the posts of a user by their id
exports.getAllPostsById = async (req, res) => {
    try {
        // const response = this.checkUserValidity(req, res);
        // if (!response.ok) return response;
        //i will get the user id here through the params and firstly check whether the user exists or not then i will fetch all the posts via that id by checking the author
        let devId = req.params.id;
        // const user = await Dev.findById(devId);
        // if (!user) {
        //     return res.status(400).json({
        //         message: "User not found"
        //     })
        // }
        try {
            const devPostList = await Post.find({
                author: devId
            })
            return res.status(200).json({
                message: "All posts by this dev fetch successfully.",
                postList: devPostList
            })
        } catch (error) {
            return res.status(400).json({
                message: "Couldn't fetch posts by this dev.",
                error: error
            })
        }


    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
}