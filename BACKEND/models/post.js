const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dev",
        required: true
    },

    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    content: {
        type: String,
        required: true
    },

    excerpt: {
        type: String,
        maxlength: 160
    },

    tags: [{
        type: String,
        trim: true
    }],

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dev"
    }],

    savedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dev"
    }]
}, {
    timestamps: true
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;