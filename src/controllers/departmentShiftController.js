const {
  addShiftToDepartmentService,
  getDepartmentShiftsService,
  deleteDepartmentShiftService,
  updateDepartmentShiftStatusService,
  getAvailableShiftsForDepartmentService,
} = require("../services/departmentShiftService");

const addShiftToDepartment = async (req, res) => {
  try {
    const { departmentId, shiftTypeId } = req.body;
    const data = await addShiftToDepartmentService(departmentId, shiftTypeId);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - addShiftToDepartment:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const getDepartmentShifts = async (req, res) => {
  try {
    const { departmentId } = req.query; // Lấy từ query params
    const data = await getDepartmentShiftsService(departmentId);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - getDepartmentShifts:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const deleteDepartmentShift = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await deleteDepartmentShiftService(id);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - deleteDepartmentShift:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const updateDepartmentShiftStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const data = await updateDepartmentShiftStatusService(id, isActive);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - updateDepartmentShiftStatus:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const getAvailableShiftsForDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const data = await getAvailableShiftsForDepartmentService(departmentId);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - getAvailableShiftsForDepartment:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

module.exports = {
  addShiftToDepartment,
  getDepartmentShifts,
  deleteDepartmentShift,
  updateDepartmentShiftStatus,
  getAvailableShiftsForDepartment,
};
