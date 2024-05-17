const mongoose = require('mongoose');

const followingSchema = new mongoose.Schema({
    me_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    required: true,
    default: 'pending'
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

const Following = mongoose.models.Following || mongoose.model("Following", followingSchema);

module.exports = Following;