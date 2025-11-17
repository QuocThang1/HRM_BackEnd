const express = require("express");
const {
    createShiftAssignment,
    getAllShiftAssignments,
    getShiftAssignment,
    updateShiftAssignment,
    deleteShiftAssignment,
    getShiftAssignmentByStaffId,
} = require("../controllers/shiftAssignmentController");

const checkRole = require("../middleware/checkRole");

const routerAPI = express.Router();

routerAPI.post("/", checkRole("manager"), createShiftAssignment);
routerAPI.get("/", checkRole("manager"), getAllShiftAssignments);
routerAPI.get("/shift-schedule", checkRole("staff"), getShiftAssignmentByStaffId);
routerAPI.get("/:id", checkRole("manager"), getShiftAssignment);
routerAPI.put("/:id", checkRole("manager"), updateShiftAssignment);
routerAPI.delete("/:id", checkRole("manager"), deleteShiftAssignment);

module.exports = routerAPI;