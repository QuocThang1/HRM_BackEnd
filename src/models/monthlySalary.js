const mongoose = require("mongoose");

const monthlySalarySchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    totalHoursWorked: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    baseSalary: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    bonus: {
      type: Number,
      default: 0,
      min: 0,
    },
    deduction: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSalary: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    note: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "tblmonthlysalaries",
  },
);

monthlySalarySchema.index({ staffId: 1, month: 1, year: 1 }, { unique: true });

monthlySalarySchema.methods.calculateSalary = function () {
  this.baseSalary = this.totalHoursWorked * this.hourlyRate;
  this.totalSalary = this.baseSalary + this.bonus - this.deduction;
};

module.exports = mongoose.model("MonthlySalary", monthlySalarySchema);
