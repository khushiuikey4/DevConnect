const mongoose = require('mongoose');

const devSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false // never returned by default in queries
    },

    // --- profile info ---
    bio: {
        type: String,
        maxlength: 160,
        default: ""
    },
    avatar: {
        type: String, // URL to the image
        default: ""
    },
    location: {
        type: String,
        trim: true,
        default: ""
    },
    website: {
        type: String,
        trim: true,
        default: ""
    },
    socialLinks: {
        github: { type: String, default: "" },
        twitter: { type: String, default: "" },
        linkedin: { type: String, default: "" }
    },

    // --- social graph (for follow/followers, DevSidebar "who to follow") ---
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dev" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dev" }],

}, {
    timestamps: true // createdAt doubles as "joined DevConnect on..."
});

// devSchema.index(
//     { username: "text", bio: "text" },
//     { weights: { username: 5, bio: 1 }, name: "UserTextIndex" }
// );



const Dev = mongoose.model('Dev', devSchema);
module.exports = Dev;