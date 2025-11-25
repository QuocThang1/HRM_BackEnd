const express = require("express");
const {
  addShiftToDepartment,
  getDepartmentShifts,
  deleteDepartmentShift,
  updateDepartmentShiftStatus,
  getAvailableShiftsForDepartment,
} = require("../controllers/departmentShiftController");

const checkRole = require("../middleware/checkRole");

const routerAPI = express.Router();

routerAPI.post("/", checkRole("manager"), addShiftToDepartment);
routerAPI.get("/", checkRole("manager"), getDepartmentShifts);
routerAPI.get(
  "/available/:departmentId",
  checkRole("manager"),
  getAvailableShiftsForDepartment,
);
routerAPI.put("/:id/status", checkRole("manager"), updateDepartmentShiftStatus);
routerAPI.delete("/:id", checkRole("manager"), deleteDepartmentShift);

module.exports = routerAPI;
