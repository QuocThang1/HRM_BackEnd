const Staff = require("../models/staff");
const Department = require("../models/department");

class StaffDAO {
  async getStaffByID(staffId) {
    try {
      const staff = await Staff.findById(staffId).select("-password");
      return staff;
    } catch (error) {
      console.error("Error fetching staff by ID:", error);
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
      console.error("Error deleting staff by ID:", error);
      throw error;
    }
  }

  async updateStaffByID(staffId, updateData) {
    try {
      // { new: true } trả về document sau khi update
      const updatedStaff = await Staff.findByIdAndUpdate(
        staffId,
        updateData,
        { new: true }
      ).select("-password"); // loại bỏ password khi trả về
      return updatedStaff;
    } catch (error) {
      console.error("Error updating staff by ID:", error);
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      return await Staff.findOne({ "personalInfo.email": email });
    } catch (error) {
      console.error("Error finding staff by email:", error);
      throw error;
    }
  }

  async createStaff(data) {
    try {
      const staff = new Staff(data);
      return await staff.save();
    } catch (error) {
      console.error("Error creating staff:", error);
      throw error;
    }
  }

  async updateProfile(staffId, updateData) {
    try {
      const updatedStaff = await Staff.findByIdAndUpdate(
        staffId,
        updateData,
        { new: true, runValidators: true } // validate theo schema
      ).select("-password"); // loại bỏ password khi trả về

      return updatedStaff; // có thể null nếu không tìm thấy
    } catch (error) {
      console.error("Error in DAO updateProfile:", error);
      throw error;
    }
  }

  async getStaffByDepartmentId(departmentId) {
    try {
      // Lọc nhân viên theo departmentId, không cần dùng 'new'
      return await Staff.find({ departmentId: departmentId }).select(
        "personalInfo role _id"
      );
    } catch (error) {
      console.error("Error fetching staff by department:", error);
      throw error;
    }
  }

  async assignStaffToDepartment(staffId, departmentId) {
    try {
      return await Staff.findByIdAndUpdate(
        staffId,
        { departmentId: departmentId },
        { new: true }
      ).select("-password");
    } catch (error) {
      console.error("Error assigning staff to department:", error);
      throw error;
    }
  }

  async getStaffNotInDepartment(departmentId) {
    try {
      return await Staff.find({
        $or: [
          { departmentId: { $exists: false } },
          { departmentId: null },
        ]
      }).select("personalInfo role _id");
    } catch (error) {
      console.error("Error fetching staff not in department:", error);
      throw error;
    }
  }


}

module.exports = new StaffDAO();
