const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    password: String,
    role: {
      type: String,
      enum: ["admin", "manager", "staff", "candidate"],
      default: "staff",
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
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
  }
);

module.exports = mongoose.model("Staff", staffSchema);
