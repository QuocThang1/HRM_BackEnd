const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    dueDate: Date,
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "overdue"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    // Visibility: 'private' (only assignee), 'department' (dept members), 'all' (everyone)
    visibility: {
      type: String,
      enum: ["private", "department", "all"],
      default: "private",
    },
  },
  {
    timestamps: true,
    collection: "tbltasks",
  },
);

module.exports = mongoose.model("Task", taskSchema);
