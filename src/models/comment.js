const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  content: String,
  like_count: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);

module.exports = Comment;
