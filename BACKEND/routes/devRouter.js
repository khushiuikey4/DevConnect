const express = require('express');
const { getHomePage } = require('../controllers/devController');
const devRouter = express.Router();
devRouter.get('/home-page', getHomePage);
exports.devRouter = devRouter;