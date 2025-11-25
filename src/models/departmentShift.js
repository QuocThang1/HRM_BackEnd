const mongoose = require("mongoose");

const departmentShiftSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    shiftType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShiftType",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "tbldepartmentShift",
  },
);

// Index để tránh trùng lặp
departmentShiftSchema.index({ department: 1, shiftType: 1 }, { unique: true });

module.exports = mongoose.model("DepartmentShift", departmentShiftSchema);
