const Department = require("../models/department");
const Staff = require("../models/staff");

class DepartmentDAO {
    async createDepartment(data) {
        try {
            const department = new Department(data);
            return await department.save();
        } catch (error) {
            console.error("DAO Error - createDepartment:", error);
            throw error;
        }
    }

    async getAllDepartments() {
        try {
            return await Department.find()
                .populate("managerId", "personalInfo.fullName personalInfo.email role");
        } catch (error) {
            console.error("DAO Error - getAllDepartments:", error);
            throw error;
        }
    }

    async getDepartmentById(id) {
        try {
            return await Department.findById(id)
                .populate("managerId", "personalInfo.fullName personalInfo.email role");
        } catch (error) {
            console.error("DAO Error - getDepartmentById:", error);
            throw error;
        }
    }

    async updateDepartment(id, data) {
        try {
            return await Department.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            }).populate("managerId", "personalInfo.fullName personalInfo.email role");
        } catch (error) {
            console.error("DAO Error - updateDepartment:", error);
            throw error;
        }
    }

    async deleteDepartment(id) {
        try {
            return await Department.findByIdAndDelete(id);
        } catch (error) {
            console.error("DAO Error - deleteDepartment:", error);
            throw error;
        }
    }

    async getAvailableManagers() {
        try {
            return await Staff.find({
                role: "manager",
                $or: [
                    { departmentId: { $exists: false } },
                    { departmentId: null },
                ],
            }).select("personalInfo.fullName personalInfo.email role");
        } catch (error) {
            console.error("DAO Error - getAvailableManagers:", error);
            throw error;
        }
    }

    async removeDepartmentFromStaffs(departmentId) {
        try {
            return await Staff.updateMany(
                { departmentId },
                { $unset: { departmentId: "" } }
            );
        } catch (error) {
            console.error("DAO Error - removeDepartmentFromStaffs:", error);
            throw error;
        }
    }
}

module.exports = new DepartmentDAO();
