const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  otp_number: {
    type: Number
  },
  otp_expiry: Date,
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
  otp_type: {
    type: String,
    enum: ['FORGETPASSWORD', 'TWOSTEPVERIFYCATION']
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

const Otp = mongoose.models.Otp || mongoose.model("Otp", otpSchema);


module.exports = Otp;
