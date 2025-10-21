const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // 5 min expiry
});

const OTP = mongoose.model("OTP", otpSchema);
module.exports = { OTP };
