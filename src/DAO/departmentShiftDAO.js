const DepartmentShift = require("../models/departmentShift");
const ShiftType = require("../models/shiftType");

class DepartmentShiftDAO {
    async addShiftToDepartment(departmentId, shiftTypeId) {
        try {
            const departmentShift = new DepartmentShift({
                department: departmentId,
                shiftType: shiftTypeId,
                isActive: true,
            });
            return await departmentShift.save();
        } catch (error) {
            console.error("DAO Error - addShiftToDepartment:", error);
            throw error;
        }
    }

    async getDepartmentShifts(departmentId) {
        try {
            return await DepartmentShift.find({ department: departmentId })
                .populate("shiftType")
                .populate("department", "departmentName");
        } catch (error) {
            console.error("DAO Error - getDepartmentShifts:", error);
            throw error;
        }
    }

    async getAllDepartmentShifts() {
        try {
            return await DepartmentShift.find()
                .populate("shiftType")
                .populate("department", "departmentName");
        } catch (error) {
            console.error("DAO Error - getAllDepartmentShifts:", error);
            throw error;
        }
    }

    async getDepartmentShiftById(id) {
        try {
            return await DepartmentShift.findById(id)
                .populate("shiftType")
                .populate("department", "departmentName");
        } catch (error) {
            console.error("DAO Error - getDepartmentShiftById:", error);
            throw error;
        }
    }

    async checkDepartmentShiftExists(departmentId, shiftTypeId) {
        try {
            return await DepartmentShift.findOne({
                department: departmentId,
                shiftType: shiftTypeId,
            });
        } catch (error) {
            console.error("DAO Error - checkDepartmentShiftExists:", error);
            throw error;
        }
    }

    async deleteDepartmentShift(id) {
        try {
            return await DepartmentShift.findByIdAndDelete(id);
        } catch (error) {
            console.error("DAO Error - deleteDepartmentShift:", error);
            throw error;
        }
    }

    async updateDepartmentShiftStatus(id, isActive) {
        try {
            return await DepartmentShift.findByIdAndUpdate(
                id,
                { isActive },
                { new: true }
            ).populate("shiftType")
                .populate("department", "departmentName");
        } catch (error) {
            console.error("DAO Error - updateDepartmentShiftStatus:", error);
            throw error;
        }
    }

    async getAvailableShiftsForDepartment(departmentId) {
        try {
            const departmentShifts = await DepartmentShift.find({
                department: departmentId
            }).select("shiftType");

            const addedShiftIds = departmentShifts.map(ds => ds.shiftType.toString());

            return await ShiftType.find({
                _id: { $nin: addedShiftIds }
            });
        } catch (error) {
            console.error("DAO Error - getAvailableShiftsForDepartment:", error);
            throw error;
        }
    }
}

module.exports = new DepartmentShiftDAO();