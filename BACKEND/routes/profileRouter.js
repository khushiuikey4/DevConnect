const express = require('express');
const profileRouter = express.Router();
const { getDevUserProfile } = require('../controllers/devUserProfile')
profileRouter.get(`/:userId`, getDevUserProfile);
module.exports = profileRouter;