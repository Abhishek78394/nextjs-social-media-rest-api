const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema({
    follower_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  following_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

const Follower = mongoose.models.Follower || mongoose.model("Follower", followerSchema);

module.exports = Follower;