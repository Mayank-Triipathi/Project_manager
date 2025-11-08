const { mongoose, model } = require("mongoose");

const inviteSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "projects",
    required: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  invitedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  seen: {
    type: Boolean,
    default: false
  }
});

const Invite = model("invites", inviteSchema);
module.exports = { Invite };
