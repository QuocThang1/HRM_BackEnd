const express = require("express");
const {
    createSalary,
    getAllSalaries,
    getSalary,
    getSalaryByStaff,
    updateSalary,
    deleteSalary,
    getMySalary,
} = require("../controllers/salaryController");

const checkRole = require("../middleware/checkRole");

const routerAPI = express.Router();

routerAPI.post("/", checkRole("admin"), createSalary);
routerAPI.get("/", checkRole("admin"), getAllSalaries);
routerAPI.get("/my-salary", checkRole("staff", "manager"), getMySalary);
routerAPI.get("/staff/:staffId", checkRole("admin"), getSalaryByStaff);
routerAPI.get("/:id", checkRole("admin"), getSalary);
routerAPI.put("/:id", checkRole("admin"), updateSalary);
routerAPI.delete("/:id", checkRole("admin"), deleteSalary);

module.exports = routerAPI;