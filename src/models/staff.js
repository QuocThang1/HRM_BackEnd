const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "staff", "candidate"],
      required: true,
      default: "staff",
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    staffCode: {
      type: String,
    },
    personalInfo: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      address: { type: String },
      citizenId: { type: String },
      dob: { type: Date },
      gender: { type: String, enum: ["male", "female", "other"] },
    },
    employmentInfo: {
      position: { type: String },
      contractId: { type: mongoose.Schema.Types.ObjectId },
      salary: { type: Number },
      allowance: { type: Number },
      penalties: { type: Number },
    },
    candidateInfo: {
      cvUrl: { type: String, default: null },
      status: { type: String, enum: ["pending", "approved", "rejected", null], default: null },
    },
  },
  {
    timestamps: true,
    collection: "tblstaff",
  }
);

module.exports = mongoose.model("Staff", staffSchema);
