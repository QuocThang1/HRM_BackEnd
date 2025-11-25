const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff", // tham chiếu tới collection Staff
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // chỉ tạo createdAt
    collection: "tbldepartment",
  },
);

module.exports = mongoose.model("Department", departmentSchema);
