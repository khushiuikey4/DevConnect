const express = require('express');
const profileRouter = express.Router();
const { getDevUserProfile, handleFollowToggle } = require('../controllers/devUserProfile')
profileRouter.get(`/:userId`, getDevUserProfile);
profileRouter.post(`/followStatus`, handleFollowToggle);
module.exports = profileRouter;