const express = require('express')
const currentUserRouter = express.Router();
const { getCurrentUser } = require('../controllers/CurrentUser')
currentUserRouter.get('/', getCurrentUser);
module.exports = currentUserRouter;