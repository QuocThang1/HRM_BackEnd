const express = require("express");
const { createStaff, addNewEmployee } = require("../controllers/staffController");
const { handleLogin } = require("../controllers/staffController");
const { getStaff } = require("../controllers/staffController");
const { getAccount } = require("../controllers/staffController");
const { updateProfile } = require("../controllers/staffController");
const { detailEmployee, updateEmloyee, deleteEmployee } = require("../controllers/adminController");
const { createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment, } = require("../controllers/departmentController");
const auth = require("../middleware/jwt"); // Importing delay middleware

const routerAPI = express.Router();

routerAPI.all("*", auth); // Apply delay middleware to all routes

routerAPI.get("/", (req, res) => {
  return res.status(200).json("Hello World API");
});

//staff routes
routerAPI.post("/register", createStaff);
routerAPI.post("/login", handleLogin); // Assuming you have a handleLogin function
routerAPI.get("/staff", getStaff); // Example route for getting staff data
routerAPI.get("/account", getAccount); // Example route for getting account data
routerAPI.put("/profile", updateProfile); // Example route for updating profile
routerAPI.post("/add-employee", addNewEmployee); // New route for adding an employee
routerAPI.delete("/:id", deleteEmployee);
routerAPI.put("/:id", updateEmloyee);
routerAPI.get("/detail-employee/:id", detailEmployee);

//department routes
routerAPI.post("/departments", createDepartment);
routerAPI.get("/departments", getDepartments);
routerAPI.get("/departments/:id", getDepartment);
routerAPI.put("/departments/:id", updateDepartment);
routerAPI.delete("/departments/:id", deleteDepartment);

module.exports = routerAPI; //export default
