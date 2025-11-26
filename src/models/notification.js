const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: String,
    message: String,
    type: {
      type: String,
      enum: ["info", "warning", "error", "success"],
      default: "info",
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null, // null means broadcast to all
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null, // system notification if null
    },
    relatedTo: String, // e.g., "policy", "leave", "payroll", "login", etc.
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "LOGIN", "CHECK_IN", "CHECK_OUT"],
      default: "CREATE",
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
    // Scope: 'personal', 'department', 'all'
    scope: {
      type: String,
      enum: ["personal", "department", "all"],
      default: "personal",
    },
  },
  {
    timestamps: true,
    collection: "tblnotifications",
  },
);

module.exports = mongoose.model("Notification", notificationSchema);
