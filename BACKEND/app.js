const express = require('express');
const app = express();
const { authRouter } = require('./routes/authRouter')
const { devRouter } = require('./routes/devRouter')
const { postRouter } = require('./routes/postRouter')
const searchRouter = require('./routes/searchRouter')
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo.default || connectMongo;
const path = require("path");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
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
// server (app.js)
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(session({
    secret: "ferrox",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_PATH }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }   // 1 day
}));
app.use(express.urlencoded({ extended: true }));
app.use('/authentication', authRouter);
app.use('/dev', postRouter);
app.use('/search', searchRouter);
app.use('/dev', devRouter);