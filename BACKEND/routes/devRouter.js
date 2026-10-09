const express = require('express');
const devRouter = express.Router();
const { getAllDevs, getDev, updateDev, deleteDev } = require("../controllers/devController")
devRouter.get('/get-all-devs', getAllDevs);
devRouter.get('/get-dev/:id', getDev);
devRouter.post('/update-dev/:id', updateDev);
devRouter.delete('/delete-dev/:id', deleteDev);

exports.devRouter = devRouter;