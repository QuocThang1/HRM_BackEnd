const ShiftAssignment = require("../models/shiftAssignment");

class ShiftAssignmentDAO {
    async createShiftAssignment(data) {
        try {
            const shiftAssignment = new ShiftAssignment(data);
            return await shiftAssignment.save();
        } catch (error) {
            console.error("DAO Error - createShiftAssignment:", error);
            throw error;
        }
    }

    async getAllShiftAssignments() {
        try {
            return await ShiftAssignment.find()
                .populate("staff", "personalInfo.fullName personalInfo.email")
                .populate("shiftType")
                .populate("department", "departmentName")
                .populate("createdBy", "personalInfo.fullName");
        } catch (error) {
            console.error("DAO Error - getAllShiftAssignments:", error);
            throw error;
        }
    }

    async getShiftAssignmentsByDepartment(departmentId) {
        try {
            return await ShiftAssignment.find({ department: departmentId })
                .populate("staff", "personalInfo.fullName personalInfo.email")
                .populate("shiftType")
                .populate("department", "departmentName")
                .populate("createdBy", "personalInfo.fullName");
        } catch (error) {
            console.error("DAO Error - getShiftAssignmentsByDepartment:", error);
            throw error;
        }
    }

    async getShiftAssignmentsByStaff(staffId) {
        try {
            return await ShiftAssignment.find({ staff: staffId })
                .populate("shiftType")
                .populate("department", "departmentName")
                .populate("createdBy", "personalInfo.fullName");
        } catch (error) {
            console.error("DAO Error - getShiftAssignmentsByStaff:", error);
            throw error;
        }
    }

    async getShiftAssignmentById(id) {
        try {
            return await ShiftAssignment.findById(id)
                .populate("staff", "personalInfo.fullName personalInfo.email")
                .populate("shiftType")
                .populate("department", "departmentName")
                .populate("createdBy", "personalInfo.fullName");
        } catch (error) {
            console.error("DAO Error - getShiftAssignmentById:", error);
            throw error;
        }
    }

    async checkStaffAvailability(staffId, fromDate, toDate) {
        try {
            // Kiểm tra xem staff đã có ca làm nào trong khoảng thời gian này chưa
            return await ShiftAssignment.findOne({
                staff: staffId,
                status: { $ne: "cancelled" },
                $or: [
                    // Khoảng thời gian mới nằm trong khoảng cũ
                    { fromDate: { $lte: fromDate }, toDate: { $gte: fromDate } },
                    // Khoảng thời gian mới bắt đầu trước và kết thúc sau khoảng cũ
                    { fromDate: { $lte: toDate }, toDate: { $gte: toDate } },
                    // Khoảng thời gian mới bao trùm khoảng cũ
                    { fromDate: { $gte: fromDate }, toDate: { $lte: toDate } },
                ],
            });
        } catch (error) {
            console.error("DAO Error - checkStaffAvailability:", error);
            throw error;
        }
    }

    async updateShiftAssignment(id, data) {
        try {
            return await ShiftAssignment.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            })
                .populate("staff", "personalInfo.fullName personalInfo.email")
                .populate("shiftType")
                .populate("department", "departmentName")
                .populate("createdBy", "personalInfo.fullName");
        } catch (error) {
            console.error("DAO Error - updateShiftAssignment:", error);
            throw error;
        }
    }

    async deleteShiftAssignment(id) {
        try {
            return await ShiftAssignment.findByIdAndDelete(id);
        } catch (error) {
            console.error("DAO Error - deleteShiftAssignment:", error);
            throw error;
        }
    }

    async checkShiftInUse(departmentId, shiftTypeId) {
        try {
            return await ShiftAssignment.findOne({
                department: departmentId,
                shiftType: shiftTypeId,
                status: "scheduled",
            });
        } catch (error) {
            console.error("DAO Error - checkShiftInUse:", error);
            throw error;
        }
    }
}

module.exports = new ShiftAssignmentDAO();