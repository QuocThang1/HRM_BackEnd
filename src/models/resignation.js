const mongoose = require("mongoose");

const resignationSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    processedAt: {
      type: Date,
    },
    adminNote: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "tblresignations",
  },
);

// Index để tìm kiếm nhanh
resignationSchema.index({ staffId: 1, status: 1 });
resignationSchema.index({ approvedBy: 1, status: 1 });

module.exports = mongoose.model("Resignation", resignationSchema);
