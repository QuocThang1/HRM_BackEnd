require("dotenv").config();
const Staff = require("../models/staff.js");
const bcrypt = require("bcrypt");
const staffDAO = require("../DAO/staffDAO.js");

// GET ALL STAFFS
const getStaffService = async () => {
  try {
    const staffs = await Staff.find({})
      .select("username role personalInfo.fullName personalInfo.email")
      .lean();

    const result = staffs.map((s) => ({
      _id: s._id,
      username: s.username,
      role: s.role,
      fullName: s.personalInfo?.fullName || "",
      email: s.personalInfo?.email || "",
    }));

    return result;
  } catch (error) {
    console.error("Error retrieving staffs:", error);
    return null;
  }
};

const addNewStaffService = async ({ username, password, fullName, email, phone, address }) => {
  try {
    // Check trùng email
    const existing = await staffDAO.findByEmail(email);
    if (existing) {
      throw new Error("Email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Chuẩn bị data
    const staffData = {
      username,
      password: hashedPassword,
      personalInfo: {
        fullName,
        email,
        phone,
        address,
      },
    };

    // Tạo mới staff
    const newStaff = await staffDAO.createStaff(staffData);
    return newStaff;
  } catch (error) {
    console.error("Error in addNewEmployeeService:", error);
    throw error;
  }
};

const getOneStaffService = async (staffId) => {
  try {
    const staff = await staffDAO.getStaffByID(staffId);
    if (!staff) {
      return { EC: 1, EM: "Staff not found" };
    }

    return {
      EC: 0,
      EM: "Success",
      staff,
    };
  } catch (error) {
    console.error("Error in detailEmployeeService:", error);
    return { EC: 2, EM: "Server error" };
  }
};

const updateStaffService = async (staffId, updateData) => {
  try {
    const updatedStaff = await staffDAO.updateStaffByID(staffId, updateData);
    if (!updatedStaff) {
      return { success: false, message: "Staff not found" };
    }
    return { success: true, staff: updatedStaff };
  } catch (error) {
    console.error("Error in updateStaffService:", error);
    return { success: false, message: "Error updating staff" };
  }
};

const deleteStaffService = async (staffId) => {
  try {
    const deletedStaff = await staffDAO.deleteStaffByID(staffId);
    if (!deletedStaff) {
      return { success: false, message: "Staff not found" };
    }
    return { success: true, staff: deletedStaff };
  } catch (error) {
    console.error("Error in deleteStaffService:", error);
    return { success: false, message: "Error deleting staff" };
  }
};

const getStaffByDepartmentService = async (departmentId) => {
  return await staffDAO.getStaffByDepartmentId(departmentId);
};

const assignStaffToDepartmentService = async (staffId, departmentId) => {
  return await staffDAO.assignStaffToDepartment(staffId, departmentId);
};

const getStaffNotInDepartmentService = async (departmentId) => {
  return await staffDAO.getStaffNotInDepartment(departmentId);
};

module.exports = {
  getStaffService,
  addNewStaffService,
  getOneStaffService,
  updateStaffService,
  deleteStaffService,
  getStaffByDepartmentService,
  assignStaffToDepartmentService,
  getStaffNotInDepartmentService
};
