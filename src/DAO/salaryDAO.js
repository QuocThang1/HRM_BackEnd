const Salary = require("../models/salary");

class SalaryDAO {
    async createSalary(data) {
        try {
            const salary = new Salary(data);
            return await salary.save();
        } catch (error) {
            console.error("DAO Error - createSalary:", error);
            throw error;
        }
    }

    async getAllSalaries() {
        try {
            return await Salary.find().populate(
                "staffId",
                "personalInfo.fullName personalInfo.email role departmentId"
            );
        } catch (error) {
            console.error("DAO Error - getAllSalaries:", error);
            throw error;
        }
    }

    async getSalaryById(id) {
        try {
            return await Salary.findById(id).populate(
                "staffId",
                "personalInfo.fullName personalInfo.email role departmentId"
            );
        } catch (error) {
            console.error("DAO Error - getSalaryById:", error);
            throw error;
        }
    }

    async getSalaryByStaff(staffId) {
        try {
            return await Salary.findOne({ staffId });
        } catch (error) {
            console.error("DAO Error - getSalaryByStaff:", error);
            throw error;
        }
    }

    async updateSalary(id, data) {
        try {
            return await Salary.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            }).populate(
                "staffId",
                "personalInfo.fullName personalInfo.email role departmentId"
            );
        } catch (error) {
            console.error("DAO Error - updateSalary:", error);
            throw error;
        }
    }

    async deleteSalary(id) {
        try {
            return await Salary.findByIdAndDelete(id);
        } catch (error) {
            console.error("DAO Error - deleteSalary:", error);
            throw error;
        }
    }
}

module.exports = new SalaryDAO();