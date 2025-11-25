const MonthlySalary = require("../models/monthlySalary");

class MonthlySalaryDAO {
  async createMonthlySalary(data) {
    try {
      const monthlySalary = new MonthlySalary(data);
      monthlySalary.calculateSalary();
      return await monthlySalary.save();
    } catch (error) {
      console.error("DAO Error - createMonthlySalary:", error);
      throw error;
    }
  }

  async getAllMonthlySalaries() {
    try {
      return await MonthlySalary.find()
        .populate(
          "staffId",
          "personalInfo.fullName personalInfo.email role departmentId",
        )
        .populate("createdBy", "personalInfo.fullName")
        .sort({ year: -1, month: -1 });
    } catch (error) {
      console.error("DAO Error - getAllMonthlySalaries:", error);
      throw error;
    }
  }

  async getMonthlySalaryById(id) {
    try {
      return await MonthlySalary.findById(id)
        .populate(
          "staffId",
          "personalInfo.fullName personalInfo.email role departmentId",
        )
        .populate("createdBy", "personalInfo.fullName");
    } catch (error) {
      console.error("DAO Error - getMonthlySalaryById:", error);
      throw error;
    }
  }

  async getMonthlySalariesByStaff(staffId) {
    try {
      return await MonthlySalary.find({ staffId })
        .populate("createdBy", "personalInfo.fullName")
        .sort({ year: -1, month: -1 });
    } catch (error) {
      console.error("DAO Error - getMonthlySalariesByStaff:", error);
      throw error;
    }
  }

  async getMonthlySalaryByStaffAndMonth(staffId, month, year) {
    try {
      return await MonthlySalary.findOne({ staffId, month, year }).populate(
        "createdBy",
        "personalInfo.fullName",
      );
    } catch (error) {
      console.error("DAO Error - getMonthlySalaryByStaffAndMonth:", error);
      throw error;
    }
  }

  async getMonthlySalariesByMonth(month, year) {
    try {
      return await MonthlySalary.find({ month, year })
        .populate(
          "staffId",
          "personalInfo.fullName personalInfo.email role departmentId",
        )
        .populate("createdBy", "personalInfo.fullName")
        .sort({ "staffId.personalInfo.fullName": 1 });
    } catch (error) {
      console.error("DAO Error - getMonthlySalariesByMonth:", error);
      throw error;
    }
  }

  async updateMonthlySalary(id, data) {
    try {
      const monthlySalary = await MonthlySalary.findById(id);
      if (!monthlySalary) {
        throw new Error("Monthly salary not found");
      }

      Object.assign(monthlySalary, data);
      monthlySalary.calculateSalary();

      return await monthlySalary.save();
    } catch (error) {
      console.error("DAO Error - updateMonthlySalary:", error);
      throw error;
    }
  }

  async deleteMonthlySalary(id) {
    try {
      return await MonthlySalary.findByIdAndDelete(id);
    } catch (error) {
      console.error("DAO Error - deleteMonthlySalary:", error);
      throw error;
    }
  }

  async checkMonthlySalaryExists(staffId, month, year) {
    try {
      const exists = await MonthlySalary.findOne({ staffId, month, year });
      return exists !== null;
    } catch (error) {
      console.error("DAO Error - checkMonthlySalaryExists:", error);
      throw error;
    }
  }
}

module.exports = new MonthlySalaryDAO();
