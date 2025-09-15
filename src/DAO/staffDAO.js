const Staff = require("../models/staff");

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
}

module.exports = new StaffDAO();
