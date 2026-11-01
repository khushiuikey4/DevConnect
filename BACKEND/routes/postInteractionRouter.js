const express = require('express')
const postInteractionRouter = express.Router();
const { postInteractionMethods } = require('../controllers/postInteractionMethods')
postInteractionRouter.post('/', postInteractionMethods);
module.exports = postInteractionRouter;