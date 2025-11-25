const express = require("express");
const {
  createMonthlySalary,
  getAllMonthlySalaries,
  getMonthlySalary,
  getMonthlySalariesByStaff,
  getMyMonthlySalaries,
  getMonthlySalariesByMonth,
  updateMonthlySalary,
  deleteMonthlySalary,
  checkMonthlySalaryExists,
} = require("../controllers/monthlySalaryController");

const checkRole = require("../middleware/checkRole");

const routerAPI = express.Router();

routerAPI.post("/", checkRole("admin"), createMonthlySalary);
routerAPI.get("/", checkRole("admin"), getAllMonthlySalaries);

routerAPI.get(
  "/my-salaries",
  checkRole("staff", "manager"),
  getMyMonthlySalaries,
);

routerAPI.get(
  "/check/:staffId/:month/:year",
  checkRole("admin"),
  checkMonthlySalaryExists,
);

routerAPI.get(
  "/month/:month/year/:year",
  checkRole("admin"),
  getMonthlySalariesByMonth,
);

routerAPI.get("/staff/:staffId", checkRole("admin"), getMonthlySalariesByStaff);

routerAPI.get("/:id", checkRole("admin"), getMonthlySalary);
routerAPI.put("/:id", checkRole("admin"), updateMonthlySalary);
routerAPI.delete("/:id", checkRole("admin"), deleteMonthlySalary);

module.exports = routerAPI;
