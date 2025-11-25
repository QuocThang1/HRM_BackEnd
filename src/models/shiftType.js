const mongoose = require("mongoose");

const shiftTypeSchema = new mongoose.Schema(
  {
    shiftCode: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    fromTime: {
      type: String,
      required: true,
    },
    toTime: {
      type: String,
      required: true,
    },
    addFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff", // tham chiếu tới Staff tạo ca làm
    },
    allowedLateMinute: {
      type: Number, // Số phút được phép đi trễ
      default: 0,
    },
    allowedEarlyLeaveMinute: {
      type: Number, // Số phút được phép về sớm
      default: 0,
    },
    isOvertime: {
      type: String,
      enum: ["normal", "overtime"],
      required: true,
      default: "normal",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "tblshiftType",
  },
);

module.exports = mongoose.model("ShiftType", shiftTypeSchema);
