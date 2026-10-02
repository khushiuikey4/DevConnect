const { body, validationResult } = require('express-validator');
const Dev = require('../models/dev');
const bcrypt = require("bcrypt");
exports.postSignUp = async (req, res) => {
    //i will get the user info to set up the account for devConnect
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Sign up failed due to invalid information.",
            errors: errors.array()
        });
    }
    const { userName, email, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 12);
    const dev = new Dev({
        userName, email, password: hashPassword
    })
    await dev.save();
    req.session.isLoggedIn = false;
    return res.status(200).json({
        message: "Sign up successful"
    })

}
exports.postSignIn = async (req, res) => {
    //the user will come here after successful sign up or only for the login if the account already exists
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Sign in failed due to invalid information.",
            errors: errors.array()
        });
    }
    const { email, password } = req.body;
    //check if the email and password exists or not 
    const dev = await Dev.findOne({ email: email });
    if (!dev) {
        return res.status(400).json({
            message: "User not found."
        })
    }
    const isMatch = await bcrypt.compare(password, dev.password);
    if (!isMatch) {
        return res.status(400).json({
            message: "Incorrect Password"
        })
    }
    req.session.dev = dev;
    req.session.isLoggedIn = true;
    return res.status(200).json({
        message: "Login Successful.",
        user: req.session.dev
    })
}
