const express = require("express");
const router = express.Router();
const {
  getTodoSummary,
  getPeriodTasks,
  getDueSoon,
  getNotifications,
  getAdminNotifications,
} = require("../controllers/todoController");

// GET /v1/api/todos/summary
router.get("/summary", getTodoSummary);

// Detailed lists
router.get("/period", getPeriodTasks);
router.get("/due-soon", getDueSoon);
router.get("/notifications", getNotifications);

// Admin notifications (GET all system changes)
router.get("/admin/notifications", getAdminNotifications);

module.exports = router;
