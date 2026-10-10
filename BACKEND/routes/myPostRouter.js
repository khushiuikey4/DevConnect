const express = require('express');
const { getMyPosts } = require('../controllers/myPostController')
const myPostRouter = express.Router();
myPostRouter.get('/', getMyPosts)

module.exports = myPostRouter;