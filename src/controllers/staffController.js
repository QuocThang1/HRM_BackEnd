const { get } = require("mongoose");
const { getStaffService,
  addNewStaffService,
  getOneStaffService,
  deleteStaffService,
  updateStaffService,
  getStaffByDepartmentService,
  assignStaffToDepartmentService,
  getStaffNotInDepartmentService } = require("../services/staffService");

const getStaff = async (req, res) => {
  const data = await getStaffService();
  return res.status(200).json(data);
};

const addNewStaff = async (req, res) => {
  try {
    const { username, password, fullName, email, phone, address } = req.body;

    if (!username || !password || !fullName || !email || !phone || !address) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const staff = await addNewStaffService({
      username,
      password,
      fullName,
      email,
      phone,
      address,
    });

    return res.status(201).json({
      message: "Staff created successfully",
      staff,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getOneStaff = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await getOneStaffService(id);
    if (result.EC !== 0) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      EC: 2,
      EM: "Server error",
    });
  }
};

const updateStaff = async (req, res) => {
  const staffId = req.params.id; // ID nhận từ URL
  const updateData = req.body; // dữ liệu update gửi từ frontend

  const result = await updateStaffService(staffId, updateData);

  if (result.success) {
    return res.status(200).json({
      message: "Staff updated successfully",
      staff: result.staff,
    });
  } else {
    return res.status(404).json({ message: result.message });
  }
};

const deleteStaff = async (req, res) => {
  const staffId = req.params.id; // ID nhận từ route /api/staff/:id

  const result = await deleteStaffService(staffId);

  if (result.success) {
    return res.status(200).json({ message: "Staff deleted successfully", staff: result.staff });
  } else {
    return res.status(404).json({ message: result.message });
  }
};

const getStaffByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    console.log("Department ID:", departmentId);
    const staffList = await getStaffByDepartmentService(departmentId);
    return res.status(200).json({
      EC: 0,
      EM: "Fetch staff by department successfully",
      data: staffList,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      EC: 1,
      EM: "Error fetching staff by department",
    });
  }
};

const assignStaffToDepartment = async (req, res) => {
  try {
    const { staffId, departmentId } = req.body;

    if (!staffId || !departmentId) {
      return res.status(400).json({ EC: 1, EM: "staffId và departmentId là bắt buộc" });
    }

    const updatedStaff = await assignStaffToDepartmentService(staffId, departmentId);
    return res.status(200).json({
      EC: 0,
      EM: "Staff assigned to department successfully",
      data: updatedStaff,
    });
  } catch (error) {
    console.error("Error in assignStaffToDepartment:", error);
    return res.status(500).json({ EC: 1, EM: "Error assigning staff to department" });
  }
};


const getStaffNotInDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const staffList = await getStaffNotInDepartmentService(departmentId);
    return res.status(200).json({
      EC: 0,
      EM: "Fetch staff not in department successfully",
      data: staffList,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      EC: 1,
      EM: "Error fetching staff not in department",
    });
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
  getStaffNotInDepartment
};
