const Notification = require("../models/notification");
const Staff = require("../models/staff");

/**
 * Create a system notification for a change event
 * Admin receives all notifications
 * Managers/Staff receive relevant ones (department, assigned, etc.)
 *
 * @param {Object} params
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} params.type - 'info', 'warning', 'error', 'success'
 * @param {string} params.relatedTo - e.g., 'staff', 'attendance', 'leave', 'salary', 'policy', 'department', etc.
 * @param {string} params.action - 'CREATE', 'UPDATE', 'DELETE'
 * @param {ObjectId} params.userId - User who made the change
 * @param {ObjectId} params.departmentId - Department affected (optional)
 * @param {string} params.scope - 'personal', 'department', 'all' (default: 'all' for admin visibility)
 * @returns {Promise<Object>} Created notification
 */
const createNotification = async (params) => {
  try {
    const {
      title,
      message,
      type = "info",
      relatedTo,
      action,
      userId,
      departmentId,
      scope = "all",
    } = params;

    // Always create a broadcast notification that admins will see
    const notification = new Notification({
      title,
      message,
      type,
      recipientId: null, // null means visible to authorized users based on scope
      senderId: userId, // Who made the change
      relatedTo,
      read: false,
      scope: scope === "all" ? "all" : scope, // 'personal', 'department', or 'all'
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

/**
 * Notify admin of staff creation
 */
const notifyStaffCreated = async (staffData, createdBy) => {
  return createNotification({
    title: "New Staff Member Added",
    message: `${staffData.personalInfo?.fullName || "Staff"} (${staffData.personalInfo?.email}) has been added to the system`,
    type: "success",
    relatedTo: "staff",
    action: "CREATE",
    userId: createdBy,
    departmentId: staffData.departmentId,
    scope: "all",
  });
};

/**
 * Notify admin of staff update
 */
const notifyStaffUpdated = async (staffId, staffName, changes, updatedBy) => {
  return createNotification({
    title: "Staff Information Updated",
    message: `${staffName} profile has been updated. Changes: ${JSON.stringify(changes).substring(0, 100)}...`,
    type: "info",
    relatedTo: "staff",
    action: "UPDATE",
    userId: updatedBy,
    scope: "all",
  });
};

/**
 * Notify admin of attendance record
 */
const notifyAttendanceRecord = async (
  staffId,
  staffName,
  status,
  recordedBy,
) => {
  return createNotification({
    title: `Attendance: ${status}`,
    message: `${staffName} marked as ${status}`,
    type: "info",
    relatedTo: "attendance",
    action: "CREATE",
    userId: recordedBy,
    scope: "department", // Department managers see this
  });
};

/**
 * Notify admin of leave request
 */
const notifyLeaveRequest = async (
  staffId,
  staffName,
  leaveType,
  dates,
  requestedBy,
) => {
  return createNotification({
    title: "Leave Request Submitted",
    message: `${staffName} requested ${leaveType} leave (${dates})`,
    type: "warning",
    relatedTo: "leave",
    action: "CREATE",
    userId: requestedBy,
    scope: "all",
  });
};

/**
 * Notify admin of leave approval/rejection
 */
const notifyLeaveApproved = async (
  staffId,
  staffName,
  leaveType,
  approvedBy,
) => {
  return createNotification({
    title: "Leave Request Approved",
    message: `${staffName}'s ${leaveType} leave has been approved`,
    type: "success",
    relatedTo: "leave",
    action: "UPDATE",
    userId: approvedBy,
    scope: "personal", // Send to the staff member
  });
};

const notifyLeaveRejected = async (
  staffId,
  staffName,
  leaveType,
  rejectedBy,
) => {
  return createNotification({
    title: "Leave Request Rejected",
    message: `${staffName}'s ${leaveType} leave has been rejected`,
    type: "error",
    relatedTo: "leave",
    action: "UPDATE",
    userId: rejectedBy,
    scope: "personal",
  });
};

/**
 * Notify admin of salary changes
 */
const notifySalaryUpdate = async (staffId, staffName, amount, updatedBy) => {
  return createNotification({
    title: "Salary Updated",
    message: `${staffName}'s salary has been updated to ${amount}`,
    type: "warning",
    relatedTo: "salary",
    action: "UPDATE",
    userId: updatedBy,
    scope: "all",
  });
};

/**
 * Notify admin of policy changes
 */
const notifyPolicyUpdated = async (policyTitle, policyId, updatedBy) => {
  return createNotification({
    title: "Policy Updated",
    message: `Policy "${policyTitle}" has been updated or created`,
    type: "info",
    relatedTo: "policy",
    action: "UPDATE",
    userId: updatedBy,
    scope: "all",
  });
};

/**
 * Notify admin of department changes
 */
const notifyDepartmentUpdated = async (deptName, deptId, action, updatedBy) => {
  return createNotification({
    title: `Department ${action === "CREATE" ? "Created" : "Updated"}`,
    message: `Department "${deptName}" has been ${action === "CREATE" ? "created" : "updated"}`,
    type: action === "CREATE" ? "success" : "info",
    relatedTo: "department",
    action,
    userId: updatedBy,
    departmentId: deptId,
    scope: "all",
  });
};

/**
 * Notify admin of resignation
 */
const notifyResignation = async (staffId, staffName, resignedBy) => {
  return createNotification({
    title: "Staff Resignation",
    message: `${staffName} has submitted a resignation`,
    type: "warning",
    relatedTo: "resignation",
    action: "CREATE",
    userId: resignedBy,
    scope: "all",
  });
};

/**
 * Notify admin of shift assignments
 */
const notifyShiftAssignment = async (
  staffId,
  staffName,
  shiftName,
  assignedBy,
) => {
  return createNotification({
    title: "Shift Assignment Updated",
    message: `${staffName} has been assigned to ${shiftName} shift`,
    type: "info",
    relatedTo: "shift",
    action: "CREATE",
    userId: assignedBy,
    scope: "department",
  });
};

/**
 * Notify admin of user login
 */
const notifyUserLogin = async (staffId, staffName, email, role) => {
  return createNotification({
    title: `User Login: ${staffName} - ${role}`,
    message: `${staffName} (${email}) has logged in`,
    type: "info",
    relatedTo: "login",
    action: "LOGIN",
    userId: staffId,
    scope: "all",
  });
};

module.exports = {
  createNotification,
  notifyStaffCreated,
  notifyStaffUpdated,
  notifyAttendanceRecord,
  notifyLeaveRequest,
  notifyLeaveApproved,
  notifyLeaveRejected,
  notifySalaryUpdate,
  notifyPolicyUpdated,
  notifyDepartmentUpdated,
  notifyResignation,
  notifyShiftAssignment,
  notifyUserLogin,
};
