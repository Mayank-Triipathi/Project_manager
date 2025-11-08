const { mongoose, model } = require("mongoose");

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ["Not Started", "In Progress", "Completed"],
        default: "Not Started"
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: "Medium"
    },
    teamMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "tasks"
    }],
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "chats"
    }
}, { timestamps: true });

const Project = model("projects", projectSchema);
module.exports = { Project };
