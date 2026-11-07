const express = require('express');
const { getMyPosts, deleteMyPost } = require('../controllers/myPostController')
const myPostRouter = express.Router();
myPostRouter.get('/', getMyPosts)
myPostRouter.post('/delete', deleteMyPost)

module.exports = myPostRouter;