const express = require("express");
const { createUser } = require("../controllers/userController");
const { handleLogin } = require("../controllers/userController");
const { getUser } = require("../controllers/userController");
const { getAccount } = require("../controllers/userController");
const { updateProfile } = require("../controllers/userController");
const auth = require("../middleware/jwt"); // Importing delay middleware

const routerAPI = express.Router();

routerAPI.all("*", auth); // Apply delay middleware to all routes

routerAPI.get("/", (req, res) => {
    return res.status(200).json("Hello World API");
});

routerAPI.post("/register", createUser)
routerAPI.post("/login", handleLogin); // Assuming you have a handleLogin function
routerAPI.get("/user", getUser); // Example route for getting user data
routerAPI.get("/account", getAccount); // Example route for getting account data
routerAPI.put("/profile", updateProfile); // Example route for updating profile

module.exports = routerAPI; //export default
