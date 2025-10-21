const { mongoose, model } = require("mongoose");

const chatSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "projects",
        default: null
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tasks",
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

chatSchema.pre("save", function(next) {
    if (!this.project && !this.task) {
        return next(new Error("Chat must belong to either a project or a task."));
    }
    if (this.project && this.task) {
        return next(new Error("Chat cannot belong to both project and task."));
    }
    next();
});

const Chat = model("chats", chatSchema);
module.exports = { Chat };

