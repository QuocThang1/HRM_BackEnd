const {
  createShiftTypeService,
  getAllShiftTypesService,
  getShiftTypeService,
  updateShiftTypeService,
  deleteShiftTypeService,
} = require("../services/shiftTypeService");

const createShiftType = async (req, res) => {
  try {
    const {
      shiftCode,
      description,
      fromTime,
      toTime,
      allowedLateMinute,
      allowedEarlyLeaveMinute,
      isOvertime,
    } = req.body;
    const addFrom = req.staff._id; // Lấy từ middleware

    const data = await createShiftTypeService({
      shiftCode,
      description,
      fromTime,
      toTime,
      addFrom,
      allowedLateMinute,
      allowedEarlyLeaveMinute,
      isOvertime,
    });

    res.json(data);
  } catch (error) {
    console.error("Controller Error - createShiftType:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const getAllShiftTypes = async (req, res) => {
  try {
    const data = await getAllShiftTypesService();
    res.json(data);
  } catch (error) {
    console.error("Controller Error - getAllShiftTypes:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const getShiftType = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getShiftTypeService(id);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - getShiftType:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const updateShiftType = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const data = await updateShiftTypeService(id, updateData);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - updateShiftType:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const deleteShiftType = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await deleteShiftTypeService(id);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - deleteShiftType:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

module.exports = {
  createShiftType,
  getAllShiftTypes,
  getShiftType,
  updateShiftType,
  deleteShiftType,
};
