const express = require('express');
const app = express();
const { authRouter } = require('./routes/authRouter')
const { devRouter } = require('./routes/devRouter')
const searchRouter = require('./routes/searchRouter')
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');

const PORT = 3000;
require("dotenv").config();


mongoose.connect(process.env.DB_PATH).then(() => {
    console.log("MongoDB connected successfully.");
    app.listen(PORT, () => {
        console.log("Server started successfully.")
    })
}).catch((err) => {
    console.log("MongoDB : Failed to Connect.", err)
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
app.use('/dev', devRouter);
app.use('/search', searchRouter);