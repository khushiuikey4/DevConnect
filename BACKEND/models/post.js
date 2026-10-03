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
    }],
    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft"
    }
}, {
    timestamps: true
});
// // models/Post.js
// postSchema.index(
//     { title: "text", excerpt: "text", tags: "text", content: "text" },
//     { weights: { title: 5, tags: 4, excerpt: 3, content: 1 } }
// );
const Post = mongoose.model("Post", postSchema);
module.exports = Post;