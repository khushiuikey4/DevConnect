
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dev",
        required: true
    },

    comment: {
        type: String,
        required: true,
        trim: true
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dev"
    }],

    // null = normal comment
    // ObjectId = reply to another comment
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    }

}, {
    timestamps: true
});

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

    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft"
    },

    comments: [commentSchema]

}, {
    timestamps: true
});

// Text search index
postSchema.index(
    { title: "text", tags: "text", excerpt: "text", content: "text" },
    { weights: { title: 5, tags: 4, excerpt: 3, content: 1 } }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
