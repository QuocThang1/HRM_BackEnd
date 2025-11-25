const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
      unique: true,
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "tblsalaries",
  },
);

module.exports = mongoose.model("Salary", salarySchema);
