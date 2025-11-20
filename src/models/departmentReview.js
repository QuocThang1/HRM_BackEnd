const mongoose = require("mongoose");

const DepartmentReviewSchema = new mongoose.Schema(
  {
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    month: {
      type: String,
      required: true,
      match: /^[0-9]{4}-(0[1-9]|1[0-2])$/, // định dạng YYYY-MM
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    comments: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    collection: "tbldepartmentReview",
  },
);

module.exports = mongoose.model("DepartmentReview", DepartmentReviewSchema);
