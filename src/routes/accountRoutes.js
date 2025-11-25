const express = require("express");
const {
  handleSignUp,
  handleLogin,
  getAccount,
  updateProfile,
} = require("../controllers/accountController");

const routerAPI = express.Router();

routerAPI.post("/register", handleSignUp);
routerAPI.post("/login", handleLogin);
routerAPI.get("/get-account", getAccount);
routerAPI.put("/profile", updateProfile);

module.exports = routerAPI;
