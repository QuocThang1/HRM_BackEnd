const Resignation = require("../models/resignation");

class ResignationDAO {
    async createResignation(data) {
        try {
            const resignation = new Resignation(data);
            return await resignation.save();
        } catch (error) {
            console.error("DAO Error - createResignation:", error);
            throw error;
        }
    }

    async getAllResignations() {
        try {
            return await Resignation.find()
                .populate("staffId", "personalInfo.fullName personalInfo.email role departmentId")
                .populate("approvedBy", "personalInfo.fullName personalInfo.email")
                .sort({ submittedAt: -1 });
        } catch (error) {
            console.error("DAO Error - getAllResignations:", error);
            throw error;
        }
    }

    async getResignationsByApprover(approverId) {
        try {
            return await Resignation.find({ approvedBy: approverId })
                .populate("staffId", "personalInfo.fullName personalInfo.email role departmentId")
                .populate("approvedBy", "personalInfo.fullName personalInfo.email")
                .sort({ submittedAt: -1 });
        } catch (error) {
            console.error("DAO Error - getResignationsByApprover:", error);
            throw error;
        }
    }

    async getResignationsByStaff(staffId) {
        try {
            return await Resignation.find({ staffId })
                .populate("approvedBy", "personalInfo.fullName personalInfo.email")
                .sort({ submittedAt: -1 });
        } catch (error) {
            console.error("DAO Error - getResignationsByStaff:", error);
            throw error;
        }
    }

    async getResignationById(id) {
        try {
            return await Resignation.findById(id)
                .populate("staffId", "personalInfo.fullName personalInfo.email role departmentId")
                .populate("approvedBy", "personalInfo.fullName personalInfo.email");
        } catch (error) {
            console.error("DAO Error - getResignationById:", error);
            throw error;
        }
    }

    async checkPendingResignation(staffId) {
        try {
            return await Resignation.findOne({
                staffId,
                status: "pending",
            });
        } catch (error) {
            console.error("DAO Error - checkPendingResignation:", error);
            throw error;
        }
    }

    async updateResignationStatus(id, status, adminNote) {
        try {
            const updateData = {
                status,
                processedAt: new Date(),
            };
            if (adminNote) {
                updateData.adminNote = adminNote;
            }

            return await Resignation.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
            })
                .populate("staffId", "personalInfo.fullName personalInfo.email role departmentId")
                .populate("approvedBy", "personalInfo.fullName personalInfo.email");
        } catch (error) {
            console.error("DAO Error - updateResignationStatus:", error);
            throw error;
        }
    }

    async deleteResignation(id) {
        try {
            return await Resignation.findByIdAndDelete(id);
        } catch (error) {
            console.error("DAO Error - deleteResignation:", error);
            throw error;
        }
    }
}

module.exports = new ResignationDAO();