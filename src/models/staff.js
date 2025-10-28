const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    username: String,
    password: String,
    role: {
      type: String,
      enum: ["admin", "manager", "staff", "candidate"],
      default: "staff",
    },
    personalInfo: {
      fullName: String,
      email: String,
      phone: String,
      address: String,
      citizenId: String,
      dob: Date,
      gender: {
        type: String,
        enum: ["male", "female", "other"],
      },
    },
    employmentInfo: {
      position: String,
      contractId: mongoose.Schema.Types.ObjectId,
      salary: Number,
      allowance: Number,
      penalties: Number,
    },
    candidateInfo: {
      cvUrl: String,
      status: {
        type: String,
        enum: ["pending", "approved", "rejected", null],
      },
    },
  },
  {
    timestamps: true,
    collection: "tblstaff",
  },
);

module.exports = mongoose.model("Staff", staffSchema);
