const express = require('express');
const authRouter = express.Router();
const { body, validationResult } = require('express-validator');

const { postSignIn, postSignUp } = require("../controllers/authController")
authRouter.post('/sign-up', [
    body("userName")
        .trim()
        .isLength({ min: 3 })
        .withMessage("userName must be at least 3 characters")
        .matches(/^[A-Za-z][A-Za-z0-9]*\d[A-Za-z0-9]*$/)
        .withMessage(
            "userName must start with a letter and contain at least one number"
        ),
    body("email")
        .isEmail()
        .withMessage("Enter a valid email"),

    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
        .matches(/[!@#$%^&*(),.?":{}|<>_\-\\[\]/]/)
        .withMessage("Password must contain at least one special character"),
    postSignUp]);



authRouter.post('/sign-in', [body("email")
    .isEmail()
    .withMessage("Enter a valid email"),

body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>_\-\\[\]/]/)
    .withMessage("Password must contain at least one special character"), postSignIn]);
exports.authRouter = authRouter;