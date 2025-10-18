const Staff = require("../models/staff");
const Department = require("../models/department");

class StaffDAO {
  async getAllStaff() {
    try {
      return await Staff.find().select("-password");
    } catch (error) {
      console.error("DAO Error - getAllStaff:", error);
      throw error;
    }
  }

  async getStaffByID(staffId) {
    try {
      return await Staff.findById(staffId).select("-password");
    } catch (error) {
      console.error("DAO Error - getStaffByID:", error);
      throw error;
    }
  }


  async deleteStaffByID(staffId) {
    try {
      const deletedStaff = await Staff.findByIdAndDelete(staffId);
      if (deletedStaff) {
        await Department.updateMany(
          { managerId: staffId },
          { $unset: { managerId: "" } }
        );
      }
      return deletedStaff;
    } catch (error) {
      console.error("DAO Error - deleteStaffByID:", error);
      throw error;
    }
  }

  async updateStaffByID(staffId, updateData) {
    try {
      return await Staff.findByIdAndUpdate(staffId, updateData, { new: true }).select("-password");
    } catch (error) {
      console.error("DAO Error - updateStaffByID:", error);
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      return await Staff.findOne({ "personalInfo.email": email });
    } catch (error) {
      console.error("DAO Error - findByEmail:", error);
      throw error;
    }
  }

  async createStaff(data) {
    try {
      const staff = new Staff(data);
      return await staff.save();
    } catch (error) {
      console.error("DAO Error - createStaff:", error);
      throw error;
    }
  }

  async updateProfile(staffId, updateData) {
    try {
      return await Staff.findByIdAndUpdate(staffId, updateData, { new: true, runValidators: true }).select("-password");
    } catch (error) {
      console.error("DAO Error - updateProfile:", error);
      throw error;
    }
  }

  async getStaffByDepartmentId(departmentId) {
    try {
      return await Staff.find({ departmentId }).select("personalInfo role _id");
    } catch (error) {
      console.error("DAO Error - getStaffByDepartmentId:", error);
      throw error;
    }
  }

  async assignStaffToDepartment(staffId, departmentId) {
    try {
      return await Staff.findByIdAndUpdate(staffId, { departmentId }, { new: true }).select("-password");
    } catch (error) {
      console.error("DAO Error - assignStaffToDepartment:", error);
      throw error;
    }
  }

  async getStaffNotInDepartment() {
    try {
      return await Staff.find({
        role: "staff",
        $or: [{ departmentId: { $exists: false } }, { departmentId: null }],
      }).select("personalInfo role _id");
    } catch (error) {
      console.error("DAO Error - getStaffNotInDepartment:", error);
      throw error;
    }
  }

  async removeStaffFromDepartment(staffId) {
    try {
      const staff = await Staff.findById(staffId);
      if (staff && staff.role === "manager" && staff.departmentId) {
        await Department.updateOne(
          { _id: staff.departmentId, managerId: staffId },
          { managerId: null }
        );
      }

      return await Staff.findByIdAndUpdate(
        staffId,
        { departmentId: null },
        { new: true, runValidators: true }
      ).select("-password");
    } catch (error) {
      console.error("DAO Error - removeStaffFromDepartment:", error);
      throw error;
    }
  }

}

module.exports = new StaffDAO();
