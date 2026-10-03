const express = require('express');
const { getAll, getPeople, getPosts } = require('../controllers/searchController')
const searchRouter = express.Router();
searchRouter.get('/all', getAll);
searchRouter.get('/people', getPeople);
searchRouter.get('/posts', getPosts);
module.exports = searchRouter;