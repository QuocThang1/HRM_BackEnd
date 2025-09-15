const express = require("express");
const { createStaff } = require("../controllers/staffController");
const { handleLogin } = require("../controllers/staffController");
const { getStaff } = require("../controllers/staffController");
const { getAccount } = require("../controllers/staffController");
const { updateProfile } = require("../controllers/staffController");
const auth = require("../middleware/jwt"); // Importing delay middleware

const routerAPI = express.Router();

routerAPI.all("*", auth); // Apply delay middleware to all routes

routerAPI.get("/", (req, res) => {
  return res.status(200).json("Hello World API");
});

routerAPI.post("/register", createStaff);
routerAPI.post("/login", handleLogin); // Assuming you have a handleLogin function
routerAPI.get("/staff", getStaff); // Example route for getting staff data
routerAPI.get("/account", getAccount); // Example route for getting account data
routerAPI.put("/profile", updateProfile); // Example route for updating profile

module.exports = routerAPI; //export default
