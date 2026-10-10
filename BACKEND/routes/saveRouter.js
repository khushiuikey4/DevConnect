const express = require('express');
const { getSavedPosts } = require('../controllers/savedController')
const saveRouter = express.Router();
saveRouter.get('/', getSavedPosts);
module.exports = saveRouter;