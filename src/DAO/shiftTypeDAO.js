const ShiftType = require("../models/shiftType");
const DepartmentShift = require("../models/departmentShift");
const ShiftAssignment = require("../models/shiftAssignment");

class ShiftTypeDAO {
  async createShiftType(data) {
    try {
      const shiftType = new ShiftType(data);
      return await shiftType.save();
    } catch (error) {
      console.error("DAO Error - createShiftType:", error);
      throw error;
    }
  }

  async getAllShiftTypes() {
    try {
      return await ShiftType.find().populate(
        "addFrom",
        "personalInfo.fullName personalInfo.email role",
      );
    } catch (error) {
      console.error("DAO Error - getAllShiftTypes:", error);
      throw error;
    }
  }

  async getShiftTypeById(id) {
    try {
      return await ShiftType.findById(id).populate(
        "addFrom",
        "personalInfo.fullName personalInfo.email role",
      );
    } catch (error) {
      console.error("DAO Error - getShiftTypeById:", error);
      throw error;
    }
  }

  async updateShiftType(id, data) {
    try {
      return await ShiftType.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      }).populate("addFrom", "personalInfo.fullName personalInfo.email role");
    } catch (error) {
      console.error("DAO Error - updateShiftType:", error);
      throw error;
    }
  }

  async deleteShiftType(id) {
    try {
      return await ShiftType.findByIdAndDelete(id);
    } catch (error) {
      console.error("DAO Error - deleteShiftType:", error);
      throw error;
    }
  }

  async findByShiftCode(shiftCode) {
    try {
      return await ShiftType.findOne({ shiftCode });
    } catch (error) {
      console.error("DAO Error - findByShiftCode:", error);
      throw error;
    }
  }

  async checkShiftTypeInUse(shiftTypeId) {
    try {
      return await ShiftAssignment.findOne({
        shiftType: shiftTypeId,
        status: { $in: ["scheduled", "completed"] },
      });
    } catch (error) {
      console.error("DAO Error - checkShiftTypeInUse:", error);
      throw error;
    }
  }

  async deleteDepartmentShiftsByShiftType(shiftTypeId) {
    try {
      return await DepartmentShift.deleteMany({ shiftType: shiftTypeId });
    } catch (error) {
      console.error("DAO Error - deleteDepartmentShiftsByShiftType:", error);
      throw error;
    }
  }
}

module.exports = new ShiftTypeDAO();
