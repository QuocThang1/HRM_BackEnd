const express = require("express");
const { createDepartment,
    getDepartments,
    getDepartment,
    updateDepartment,
    deleteDepartment,
    getAvailableManagers,
    getDepartmentByManager } = require("../controllers/departmentController");

const checkRole = require("../middleware/checkRole");

const routerAPI = express.Router();

routerAPI.post("/", checkRole("admin"), createDepartment);
routerAPI.get("/", checkRole("admin"), getDepartments);
routerAPI.get("/manager-department", checkRole("manager"), getDepartmentByManager);
routerAPI.get("/staff/available-managers", checkRole("admin"), getAvailableManagers);
routerAPI.get("/:id", checkRole("admin"), getDepartment);
routerAPI.put("/:id", checkRole("admin"), updateDepartment);
routerAPI.delete("/:id", checkRole("admin"), deleteDepartment);

module.exports = routerAPI;