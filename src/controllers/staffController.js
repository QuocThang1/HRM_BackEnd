const {
  getStaffService,
  addNewStaffService,
  getOneStaffService,
  updateStaffService,
  deleteStaffService,
  getStaffByDepartmentService,
  assignStaffToDepartmentService,
  getStaffNotInDepartmentService,
  removeStaffFromDepartmentService,
} = require("../services/staffService");
const {
  notifyStaffCreated,
  notifyStaffUpdated,
} = require("../services/notificationService");

const getStaff = async (req, res) => {
  try {
    const { role } = req.query; // Lấy role từ query params
    const data = await getStaffService(role);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - getStaff:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const addNewStaff = async (req, res) => {
  try {
    const {
      password,
      fullName,
      email,
      phone,
      address,
      citizenId,
      gender,
      dob,
    } = req.body;
    const data = await addNewStaffService({
      password,
      fullName,
      email,
      phone,
      address,
      citizenId,
      gender,
      dob,
    });

    // Notify admin of new staff creation
    if (data && data.EC === 0 && data.DT) {
      await notifyStaffCreated(data.DT, req.staff?._id);
    }

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

    // Notify admin of staff update
    if (data && data.EC === 0) {
      await notifyStaffUpdated(
        staffId,
        data.DT?.personalInfo?.fullName || "Staff",
        updateData,
        req.staff?._id,
      );
    }

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
