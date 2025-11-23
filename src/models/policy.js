const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            enum: [
                "leave",
                "salary",
                "working_hours",
                "benefits",
                "discipline",
                "recruitment",
                "general",
            ],
        },
        content: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staff",
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        collection: "tblpolicies",
    }
);

policySchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("Policy", policySchema);