const express = require('express');
const { getMyPosts, deleteMyPost, editMyPost, getMyPost } = require('../controllers/myPostController')
const myPostRouter = express.Router();
myPostRouter.get('/', getMyPosts)
myPostRouter.post('/delete', deleteMyPost)
myPostRouter.post('/edit', editMyPost)
myPostRouter.post('/get-post', getMyPost)

module.exports = myPostRouter;