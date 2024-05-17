const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  comment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
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

const Like = mongoose.models.Like || mongoose.model("Like", likeSchema);

module.exports = Like;
