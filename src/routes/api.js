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
const { handleSignUp,
  handleLogin,
  getAccount,
  updateProfile, } = require("../controllers/accountController");
const { createDepartment,
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
  getDepartmentByManager } = require("../controllers/departmentController");
const { submitCV,
  getAllCandidates,
  updateCandidateStatus
} = require("../controllers/candidateController");
const {
  createShiftType,
  getAllShiftTypes,
  getShiftType,
  updateShiftType,
  deleteShiftType,
} = require("../controllers/shiftTypeController");
const {
  addShiftToDepartment,
  getDepartmentShifts,
  deleteDepartmentShift,
  updateDepartmentShiftStatus,
  getAvailableShiftsForDepartment
} = require("../controllers/departmentShiftController");
const {
  createShiftAssignment,
  getAllShiftAssignments,
  getShiftAssignment,
  updateShiftAssignment,
  deleteShiftAssignment,
  getShiftAssignmentByStaffId,
} = require("../controllers/shiftAssignmentController");
const {
  checkIn,
  checkOut,
  getMyAttendances,
  getAttendancesByDepartment,
  getAllAttendances,
  getTodayAttendance,
} = require("../controllers/attendanceController");
const {
  submitResignation,
  getMyResignations,
  getResignationsByApprover,
  getAllResignations,
  updateResignationStatus,
  deleteResignation,
} = require("../controllers/resignationController");
const auth = require("../middleware/jwt"); // Importing delay middleware

const routerAPI = express.Router();

routerAPI.all("*", auth); // Apply delay middleware to all routes

routerAPI.get("/", (req, res) => {
  return res.status(200).json("Hello World API");
});

//account routes
routerAPI.post("/register", handleSignUp);
routerAPI.post("/login", handleLogin); // Assuming you have a handleLogin function
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
routerAPI.get("/staff/not-in-department/:departmentId", getStaffNotInDepartment);
routerAPI.put("/staff/remove-from-department", removeStaffFromDepartment);


//department routes
routerAPI.post("/departments", createDepartment);
routerAPI.get("/departments", getDepartments);
routerAPI.get("/departments/manager-department", getDepartmentByManager);
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

//shift type routes
routerAPI.post("/shift-types", createShiftType);
routerAPI.get("/shift-types", getAllShiftTypes);
routerAPI.get("/shift-types/:id", getShiftType);
routerAPI.put("/shift-types/:id", updateShiftType);
routerAPI.delete("/shift-types/:id", deleteShiftType);

//department shift routes
routerAPI.post("/department-shifts", addShiftToDepartment);
routerAPI.get("/department-shifts", getDepartmentShifts);
routerAPI.delete("/department-shifts/:id", deleteDepartmentShift);
routerAPI.put("/department-shifts/:id/status", updateDepartmentShiftStatus);
routerAPI.get("/department-shifts/available/:departmentId", getAvailableShiftsForDepartment);

//shift assignment routes
routerAPI.post("/shift-assignments", createShiftAssignment);
routerAPI.get("/shift-assignments", getAllShiftAssignments);
routerAPI.get("/shift-assignments/:id", getShiftAssignment);
routerAPI.put("/shift-assignments/:id", updateShiftAssignment);
routerAPI.delete("/shift-assignments/:id", deleteShiftAssignment);
routerAPI.get("/shift-schedule", getShiftAssignmentByStaffId);

//attendance routes
routerAPI.post("/attendances/check-in", checkIn);
routerAPI.post("/attendances/check-out", checkOut);
routerAPI.get("/attendances/today", getTodayAttendance);
routerAPI.get("/attendances/my-attendances", getMyAttendances);
routerAPI.get("/attendances/department/:departmentId", getAttendancesByDepartment);
routerAPI.get("/attendances", getAllAttendances);

//resignation routes
routerAPI.post("/resignations", submitResignation);
routerAPI.get("/resignations/my-resignations", getMyResignations);
routerAPI.get("/resignations/approver", getResignationsByApprover);
routerAPI.get("/resignations", getAllResignations);
routerAPI.put("/resignations/:id/status", updateResignationStatus);
routerAPI.delete("/resignations/:id", deleteResignation);

module.exports = routerAPI; //export default
