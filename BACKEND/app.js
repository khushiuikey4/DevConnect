const express = require('express');
const app = express();
const { authRouter } = require('./routes/authRouter')
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const DB_PATH = "mongodb+srv://khuxxhi444_db_user:9vdTTlH7xXeeh93z@ferrox.ocin5yt.mongodb.net/devConnect?appName=ferrox";

const PORT = 3000;

mongoose.connect(DB_PATH).then(() => {
    console.log("MongoDB connected successfully.");
    app.listen(PORT, () => {
        console.log("Server started successfully.")
    })
}).catch(() => {
    console.log("MongoDB : Failed to Connect.")
})
app.use(cors());
app.use(express.json());
app.use(
    session({
        secret: "ferrox",
        resave: false,
        saveUninitialized: false
    })
)
app.use(express.urlencoded({ extended: true }));
app.use('/authentication', authRouter);