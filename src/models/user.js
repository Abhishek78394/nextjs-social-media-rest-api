const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: function (v){
        return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  name: {
    type: String,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
    required: true
  },
  bio: {
    type: String
  },
  gender: {
    type: String,
    enum: ['male', 'female']
  },
  avatar: {
    type: String
  },
  registration_date: {
    type: Date,
    default: Date.now
  },
  last_login: {
    type: Date
  },
  reset_token: {
    type: String,
  },
  two_step_verification_enabled: {
    type: Boolean,
    default: false
  },
  privacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'private'
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


const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;