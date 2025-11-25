const express = require("express");
const {
  handleSignUp,
  handleLogin,
  getAccount,
  updateProfile,
  handleForgotPassword,
  handleResetPassword,
  handleVerifyOtp,
} = require("../controllers/accountController");

const routerAPI = express.Router();

routerAPI.post("/register", handleSignUp);
routerAPI.post("/login", handleLogin);
routerAPI.get("/get-account", getAccount);
routerAPI.put("/profile", updateProfile);

// Password reset/OTP routes
routerAPI.post("/forgot-password", handleForgotPassword);
routerAPI.post("/verify-otp", handleVerifyOtp);
routerAPI.post("/reset-password", handleResetPassword);

module.exports = routerAPI;
