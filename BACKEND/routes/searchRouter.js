const express = require('express');
const { getAll, getFiltered, searchOwnPostsHandler } = require('../controllers/searchController')
const searchRouter = express.Router();
// searchRouter.get('/all', getAll);
// searchRouter.get('/people', getPeople);
// searchRouter.get('/posts', getPosts);
searchRouter.get('/', getAll)
searchRouter.get('/dev', searchOwnPostsHandler)
searchRouter.post('/', getFiltered);

module.exports = searchRouter;