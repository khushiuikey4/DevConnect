const express = require('express');
const { getAll, getFiltered, searchOwnPostsHandler, searchSavedPostsHandler } = require('../controllers/searchController')
const searchRouter = express.Router();
// searchRouter.get('/all', getAll);
// searchRouter.get('/people', getPeople);
// searchRouter.get('/posts', getPosts);
searchRouter.get('/', getAll)
searchRouter.get('/dev', searchOwnPostsHandler)
searchRouter.get('/saved', searchSavedPostsHandler)
searchRouter.post('/', getFiltered);

module.exports = searchRouter;