const express = require("express");
const { getStaff,
    addNewStaff,
    getOneStaff,
    updateStaff,
    deleteStaff,
    getStaffByDepartment,
    assignStaffToDepartment,
    getStaffNotInDepartment,
    removeStaffFromDepartment } = require("../controllers/staffController");

const checkRole = require("../middleware/checkRole");

const routerAPI = express.Router();

routerAPI.post("/add-employee", checkRole("admin"), addNewStaff);
routerAPI.put("/assign-department", checkRole("admin"), assignStaffToDepartment);
routerAPI.put("/remove-from-department", checkRole("admin"), removeStaffFromDepartment);
routerAPI.get("/", checkRole("admin", "staff"), getStaff);
routerAPI.get("/detail-employee/:id", checkRole("admin", "manager"), getOneStaff);
routerAPI.get("/departments/:departmentId/", checkRole("admin", "manager"), getStaffByDepartment);
routerAPI.get("/not-in-department/:departmentId", checkRole("admin"), getStaffNotInDepartment);
routerAPI.delete("/:id", checkRole("admin"), deleteStaff);
routerAPI.put("/:id", checkRole("admin"), updateStaff);

module.exports = routerAPI;