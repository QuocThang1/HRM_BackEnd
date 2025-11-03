const mongoose = require("mongoose");

const shiftAssignmentSchema = new mongoose.Schema(
    {
        staff: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staff",
            required: true,
        },
        shiftType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ShiftType",
            required: true,
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
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
            enum: ["scheduled", "completed", "cancelled"],
            default: "scheduled",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staff",
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        collection: "tblshiftAssignment",
    }
);

// Index để tránh trùng lặp trong cùng khoảng thời gian
shiftAssignmentSchema.index({ staff: 1, fromDate: 1, toDate: 1 });

module.exports = mongoose.model("ShiftAssignment", shiftAssignmentSchema);