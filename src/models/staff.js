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
    personal_info: {
      full_name: String,
      email: String,
      phone: String,
      address: String,
      citizen_id: String,
      dob: Date,
      gender: {
        type: String,
        enum: ["male", "female", "other"],
      },
    },
    employment_info: {
      position: String,
      contract_id: mongoose.Schema.Types.ObjectId,
      salary: Number,
      allowance: Number,
      penalties: Number,
    },
    candidate_info: {
      cv_url: String,
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
