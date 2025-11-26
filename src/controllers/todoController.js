const Task = require("../models/task");
const Notification = require("../models/notification");
const Staff = require("../models/staff");

const getTodoSummary = async (req, res) => {
  try {
    const userRole = req.staff?.role || "staff";
    const userId = req.staff?._id;

    let taskQuery = {};
    let notifQuery = {};

    // Admin sees all, others see only their assigned/relevant items
    if (userRole !== "admin") {
      taskQuery = {
        $or: [
          { assignedTo: userId },
          { visibility: "department", departmentId: req.staff?.departmentId },
          { visibility: "all" },
        ],
      };
      notifQuery = {
        $or: [
          { recipientId: userId },
          { scope: "department", departmentId: req.staff?.departmentId },
          { scope: "all" },
        ],
      };
    }

    const periodCount = await Task.countDocuments(taskQuery);
    const dueSoonCount = await Task.countDocuments({
      ...taskQuery,
      dueDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 24 * 60 * 60 * 1000), // within 1 day
      },
    });
    const notifCount = await Notification.countDocuments({
      ...notifQuery,
      read: false,
    });

    const summary = {
      periodTasks: periodCount,
      dueSoon: dueSoonCount,
      notifications: notifCount,
    };

    return res
      .status(200)
      .json({ EC: 0, DT: summary, EM: "Get todo summary success" });
  } catch (error) {
    console.error("Error in getTodoSummary:", error);
    return res.status(500).json({ EC: -1, EM: "Internal server error" });
  }
};

const getPeriodTasks = async (req, res) => {
  try {
    const userRole = req.staff?.role || "staff";
    const userId = req.staff?._id;

    let query = {};
    if (userRole !== "admin") {
      query = {
        $or: [
          { assignedTo: userId },
          { visibility: "department", departmentId: req.staff?.departmentId },
          { visibility: "all" },
        ],
      };
    }

    const items = await Task.find(query)
      .populate("assignedTo", "personalInfo.fullName")
      .populate("assignedBy", "personalInfo.fullName")
      .sort({ dueDate: 1 })
      .limit(50);

    return res
      .status(200)
      .json({ EC: 0, DT: items, EM: "Get period tasks success" });
  } catch (error) {
    console.error("Error in getPeriodTasks:", error);
    return res.status(500).json({ EC: -1, EM: "Internal server error" });
  }
};

const getDueSoon = async (req, res) => {
  try {
    const userRole = req.staff?.role || "staff";
    const userId = req.staff?._id;

    let query = {
      dueDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 24 * 60 * 60 * 1000), // within 1 day
      },
    };

    if (userRole !== "admin") {
      query.$or = [
        { assignedTo: userId },
        { visibility: "department", departmentId: req.staff?.departmentId },
        { visibility: "all" },
      ];
    }

    const items = await Task.find(query)
      .populate("assignedTo", "personalInfo.fullName")
      .populate("assignedBy", "personalInfo.fullName")
      .sort({ dueDate: 1 })
      .limit(50);

    return res
      .status(200)
      .json({ EC: 0, DT: items, EM: "Get due soon tasks success" });
  } catch (error) {
    console.error("Error in getDueSoon:", error);
    return res.status(500).json({ EC: -1, EM: "Internal server error" });
  }
};

const getNotifications = async (req, res) => {
  try {
    const userRole = req.staff?.role || "staff";
    const userId = req.staff?._id;

    let query = {};
    if (userRole !== "admin") {
      query = {
        $or: [
          { recipientId: userId },
          { scope: "department" },
          { scope: "all" },
        ],
      };
    }

    const items = await Notification.find(query)
      .populate("senderId", "personalInfo.fullName")
      .sort({ createdAt: -1 })
      .limit(50);

    return res
      .status(200)
      .json({ EC: 0, DT: items, EM: "Get notifications success" });
  } catch (error) {
    console.error("Error in getNotifications:", error);
    return res.status(500).json({ EC: -1, EM: "Internal server error" });
  }
};

const getAdminNotifications = async (req, res) => {
  try {
    const userRole = req.staff?.role;

    // Only admins can access this endpoint
    if (userRole !== "admin") {
      return res.status(403).json({ EC: -1, EM: "Access denied: Admin only" });
    }

    // Get ALL system notifications (admin sees everything)
    const limit = parseInt(req.query.limit) || 100;
    const skip = parseInt(req.query.skip) || 0;

    const items = await Notification.find({})
      .populate("senderId", "personalInfo.fullName email personalInfo.email")
      .populate("recipientId", "personalInfo.fullName email personalInfo.email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Notification.countDocuments({});

    return res.status(200).json({
      EC: 0,
      DT: items,
      total,
      EM: "Get all system notifications success",
    });
  } catch (error) {
    console.error("Error in getAdminNotifications:", error);
    return res.status(500).json({ EC: -1, EM: "Internal server error" });
  }
};

module.exports = {
  getTodoSummary,
  getPeriodTasks,
  getDueSoon,
  getNotifications,
  getAdminNotifications,
};
