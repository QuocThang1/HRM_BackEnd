const express = require("express");
const {
  getStaff,
  addNewStaff,
  getOneStaff,
  updateStaff,
  deleteStaff,
  getStaffByDepartment,
  assignStaffToDepartment,
  getStaffNotInDepartment,
  removeStaffFromDepartment,
} = require("../controllers/staffController");
const {
  handleSignUp,
  handleLogin,
  getAccount,
  updateProfile,
  handleForgotPassword,
  handleResetPassword,
} = require("../controllers/accountController");
const { handleVerifyOtp } = require("../controllers/accountController");
const {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
  getAvailableManagers,
  createDepartmentReview,
  getDepartmentReviews,
  getDepartmentReviewsByAdmin,
  updateDepartmentReview,
  deleteDepartmentReview,
} = require("../controllers/departmentController");
const {
  submitCV,
  getAllCandidates,
  updateCandidateStatus,
} = require("../controllers/candidateController");
const auth = require("../middleware/jwt"); // Importing delay middleware

const routerAPI = express.Router();

routerAPI.all("*", auth); // Apply delay middleware to all routes

routerAPI.get("/", (req, res) => {
  return res.status(200).json("Hello World API");
});

//account routes
routerAPI.post("/register", handleSignUp);
routerAPI.post("/login", handleLogin); // Assuming you have a handleLogin function
routerAPI.post("/forgot-password", handleForgotPassword);
routerAPI.post("/reset-password", handleResetPassword);
routerAPI.post("/verify-otp", handleVerifyOtp);
routerAPI.get("/staff", getStaff); // Example route for getting staff data
routerAPI.get("/account", getAccount); // Example route for getting account data
routerAPI.put("/profile", updateProfile); // Example route for updating profile

//staff routes
routerAPI.post("/add-employee", addNewStaff); // New route for adding an employee
routerAPI.delete("/:id", deleteStaff);
routerAPI.put("/:id", updateStaff);
routerAPI.get("/detail-employee/:id", getOneStaff);
routerAPI.get("/staff/departments/:departmentId/", getStaffByDepartment);
routerAPI.put("/staff/assign-department", assignStaffToDepartment);
routerAPI.get(
  "/staff/not-in-department/:departmentId",
  getStaffNotInDepartment,
);
routerAPI.put("/staff/remove-from-department", removeStaffFromDepartment);

//department routes
routerAPI.post("/departments", createDepartment);
routerAPI.get("/departments", getDepartments);
routerAPI.get("/departments/:id", getDepartment);
routerAPI.put("/departments/:id", updateDepartment);
routerAPI.delete("/departments/:id", deleteDepartment);
routerAPI.get("/staff/available-managers", getAvailableManagers);

//department review routes
routerAPI.post("/departments/:id/reviews", createDepartmentReview);
routerAPI.get("/departments/:id/reviews", getDepartmentReviews);
routerAPI.get("/departments/reviews/admin", getDepartmentReviewsByAdmin);
routerAPI.put("/departments/reviews/:reviewId", updateDepartmentReview);
routerAPI.delete("/departments/reviews/:reviewId", deleteDepartmentReview);

//candidate routes
routerAPI.post("/candidate/submit-cv", submitCV);
routerAPI.get("/admin/candidates", getAllCandidates);
routerAPI.put("/admin/candidates/:candidateId/status", updateCandidateStatus);

module.exports = routerAPI; //export default
