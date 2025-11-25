const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
    },
    location: {
      type: String,
      default: null,
    },
    shiftAssignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShiftAssignment",
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    isEarlyLeave: {
      type: Boolean,
      default: false,
    },
    lateMinutes: {
      type: Number,
      default: 0,
    },
    earlyLeaveMinutes: {
      type: Number,
      default: 0,
    },
    workingHours: {
      type: Number, // Số giờ làm việc thực tế
      default: 0,
    },
    note: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "tblattendances",
  },
);

// Index để tìm kiếm nhanh
attendanceSchema.index({ staffId: 1, checkIn: 1 });
attendanceSchema.index({ staffId: 1, createdAt: -1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
