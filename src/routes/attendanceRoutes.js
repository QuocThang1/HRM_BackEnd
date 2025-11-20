const express = require("express");
const {
    checkIn,
    checkOut,
    getMyAttendances,
    getAttendancesByDepartment,
    getAllAttendances,
    getTodayAttendance,
} = require("../controllers/attendanceController");

const checkRole = require("../middleware/checkRole");

const routerAPI = express.Router();

routerAPI.post("/check-in", checkRole("staff"), checkIn);
routerAPI.post("/check-out", checkRole("staff"), checkOut);
routerAPI.get("/today", checkRole("staff"), getTodayAttendance);
routerAPI.get("/", checkRole("manager"), getAllAttendances);
routerAPI.get("/my-attendances", checkRole("staff"), getMyAttendances);
routerAPI.get("/department/:departmentId", checkRole("admin", "manager"), getAttendancesByDepartment);

module.exports = routerAPI;