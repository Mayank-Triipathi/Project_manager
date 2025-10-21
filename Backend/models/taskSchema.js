const { mongoose, model } = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ["To Do", "In Progress", "Done"],
        default: "To Do"
    },
    dueDate: {
        type: Date
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: "Medium"
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }],
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "projects",
        required: true
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "chats"
    }
}, { timestamps: true });

const Task = model("tasks", taskSchema);
module.exports = { Task };
