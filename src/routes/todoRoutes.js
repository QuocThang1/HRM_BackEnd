const express = require("express");
const router = express.Router();
const {
  getTodoSummary,
  getPeriodTasks,
  getDueSoon,
  getNotifications,
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} = require("../controllers/todoController");

// GET /v1/api/todos/summary
router.get("/summary", getTodoSummary);

// Detailed lists
router.get("/period", getPeriodTasks);
router.get("/due-soon", getDueSoon);
router.get("/notifications", getNotifications);

// Mark a single notification as read
router.post("/notifications/mark-read", markNotificationRead);

// Mark all visible notifications as read for current user
router.post("/notifications/mark-all-read", markAllNotificationsRead);

// Delete a notification by id
router.delete("/notifications/:id", deleteNotification);

// Admin notifications (GET all system changes)
router.get("/admin/notifications", getAdminNotifications);

module.exports = router;
