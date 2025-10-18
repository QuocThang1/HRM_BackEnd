const {
  getStaffService,
  addNewStaffService,
  getOneStaffService,
  updateStaffService,
  deleteStaffService,
  getStaffByDepartmentService,
  assignStaffToDepartmentService,
  getStaffNotInDepartmentService,
  removeStaffFromDepartmentService
} = require("../services/staffService");

const getStaff = async (req, res) => {
  try {
    const data = await getStaffService();
    res.json(data);
  } catch (error) {
    console.error("Controller Error - getStaff:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const addNewStaff = async (req, res) => {
  try {
    const { username, password, fullName, email, phone, address } = req.body;
    const data = await addNewStaffService({ username, password, fullName, email, phone, address });
    res.json(data);
  } catch (error) {
    console.error("Controller Error - addNewStaff:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const getOneStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getOneStaffService(id);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - getOneStaff:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const updateStaff = async (req, res) => {
  try {
    const staffId = req.params.id;
    const updateData = req.body;
    const data = await updateStaffService(staffId, updateData);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - updateStaff:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await deleteStaffService(id);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - deleteStaff:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const getStaffByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const data = await getStaffByDepartmentService(departmentId);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - getStaffByDepartment:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const assignStaffToDepartment = async (req, res) => {
  try {
    const { staffId, departmentId } = req.body;
    const data = await assignStaffToDepartmentService(staffId, departmentId);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - assignStaffToDepartment:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const getStaffNotInDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const data = await getStaffNotInDepartmentService(departmentId);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - getStaffNotInDepartment:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const removeStaffFromDepartment = async (req, res) => {
  try {
    const { staffId } = req.body;
    const data = await removeStaffFromDepartmentService(staffId);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - removeStaffFromDepartment:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

module.exports = {
  getStaff,
  addNewStaff,
  getOneStaff,
  updateStaff,
  deleteStaff,
  getStaffByDepartment,
  assignStaffToDepartment,
  getStaffNotInDepartment,
  removeStaffFromDepartment,
};
