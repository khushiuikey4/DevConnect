const express = require('express');
const devRouter = express.Router();
const upload = require('../middleWear/upload')
const { getAllDevs, getDev, updateDev, deleteDev } = require("../controllers/devController")
devRouter.get('/get-all-devs', getAllDevs);
devRouter.get('/get-dev', getDev);
devRouter.post('/update-dev', upload.single('avatarFile'), updateDev);
devRouter.delete('/delete-dev', deleteDev);

exports.devRouter = devRouter;