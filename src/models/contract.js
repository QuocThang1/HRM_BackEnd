const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "tblcontracts",
  },
);

contractSchema.index({ status: 1 });
contractSchema.index({ toDate: 1 });

module.exports = mongoose.model("Contract", contractSchema);
