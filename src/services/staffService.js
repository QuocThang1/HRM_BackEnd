const bcrypt = require("bcrypt");
const staffDAO = require("../DAO/staffDAO");

const getStaffService = async () => {
  try {
    const staffs = await staffDAO.getAllStaff();
    return { EC: 0, EM: "Success", data: staffs };
  } catch (error) {
    console.error("Service Error - getStaffService:", error);
    return { EC: -1, EM: "Error fetching staff" };
  }
};

const addNewStaffService = async ({ password, fullName, email, phone, address, citizenId, gender, dob }) => {
  try {
    const existing = await staffDAO.findByEmail(email);
    if (existing) return { EC: 1, EM: "Email already exists" };

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaffData = {
      password: hashedPassword,
      personalInfo: { fullName, email, phone, address, citizenId, gender, dob },
    };

    const newStaff = await staffDAO.createStaff(newStaffData);
    return { EC: 0, EM: "Staff created successfully", data: newStaff };
  } catch (error) {
    console.error("Service Error - addNewStaffService:", error);
    return { EC: -1, EM: "Error creating staff" };
  }
};

const getOneStaffService = async (staffId) => {
  try {
    const staff = await staffDAO.getStaffByID(staffId);
    if (!staff) return { EC: 1, EM: "Staff not found" };
    return { EC: 0, EM: "Success", data: staff };
  } catch (error) {
    console.error("Service Error - getOneStaffService:", error);
    return { EC: -1, EM: "Error fetching staff" };
  }
};

const updateStaffService = async (staffId, updateData) => {
  try {
    const updatedStaff = await staffDAO.updateStaffByID(staffId, updateData);
    if (!updatedStaff) return { EC: 1, EM: "Staff not found" };
    return { EC: 0, EM: "Staff updated successfully", data: updatedStaff };
  } catch (error) {
    console.error("Service Error - updateStaffService:", error);
    return { EC: -1, EM: "Error updating staff" };
  }
};

const deleteStaffService = async (staffId) => {
  try {
    const deletedStaff = await staffDAO.deleteStaffByID(staffId);
    if (!deletedStaff) return { EC: 1, EM: "Staff not found" };
    return { EC: 0, EM: "Staff deleted successfully", data: deletedStaff };
  } catch (error) {
    console.error("Service Error - deleteStaffService:", error);
    return { EC: -1, EM: "Error deleting staff" };
  }
};

const getStaffByDepartmentService = async (departmentId) => {
  try {
    const staffList = await staffDAO.getStaffByDepartmentId(departmentId);
    return { EC: 0, EM: "Success", data: staffList };
  } catch (error) {
    console.error("Service Error - getStaffByDepartmentService:", error);
    return { EC: -1, EM: "Error fetching staff by department" };
  }
};

const assignStaffToDepartmentService = async (staffId, departmentId) => {
  try {
    const updatedStaff = await staffDAO.assignStaffToDepartment(staffId, departmentId);
    return { EC: 0, EM: "Staff assigned to department successfully", data: updatedStaff };
  } catch (error) {
    console.error("Service Error - assignStaffToDepartmentService:", error);
    return { EC: -1, EM: "Error assigning staff to department" };
  }
};

const getStaffNotInDepartmentService = async (departmentId) => {
  try {
    const staffList = await staffDAO.getStaffNotInDepartment(departmentId);
    return { EC: 0, EM: "Success", data: staffList };
  } catch (error) {
    console.error("Service Error - getStaffNotInDepartmentService:", error);
    return { EC: -1, EM: "Error fetching staff not in department" };
  }
};

const removeStaffFromDepartmentService = async (staffId) => {
  try {
    const updatedStaff = await staffDAO.removeStaffFromDepartment(staffId);
    return { EC: 0, EM: "Staff removed from department successfully", data: updatedStaff };
  } catch (error) {
    console.error("Service Error - removeStaffFromDepartmentService:", error);
    return { EC: -1, EM: "Error removing staff from department" };
  }
};

module.exports = {
  getStaffService,
  addNewStaffService,
  getOneStaffService,
  updateStaffService,
  deleteStaffService,
  getStaffByDepartmentService,
  assignStaffToDepartmentService,
  getStaffNotInDepartmentService,
  removeStaffFromDepartmentService,
};
