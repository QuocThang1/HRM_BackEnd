const attendanceDAO = require("../DAO/attendanceDAO");
const shiftAssignmentDAO = require("../DAO/shiftAssignmentDAO");
const staffDAO = require("../DAO/staffDAO");

// Helper function để tính số phút chênh lệch
const calculateMinutesDifference = (time1, time2) => {
  return Math.floor((time2 - time1) / (1000 * 60));
};

// Helper function để parse time string "HH:mm" thành Date object hôm nay
const parseTimeToToday = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const checkInService = async (staffId, location) => {
  try {
    // Kiểm tra staff có tồn tại không
    const staff = await staffDAO.getStaffByID(staffId);
    if (!staff) {
      return { EC: 1, EM: "Staff not found" };
    }

    // Kiểm tra đã check in hôm nay chưa
    const todayAttendance = await attendanceDAO.getTodayAttendance(staffId);
    if (todayAttendance) {
      return { EC: 2, EM: "Already checked in today" };
    }

    const checkInTime = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Tìm shift assignment của hôm nay
    const shiftAssignments =
      await shiftAssignmentDAO.getShiftAssignmentsByStaff(staffId);

    // Sửa logic: Kiểm tra today có nằm TRONG khoảng fromDate -> toDate không
    const todayShift = shiftAssignments.find((assignment) => {
      const fromDate = new Date(assignment.fromDate);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = new Date(assignment.toDate);
      toDate.setHours(23, 59, 59, 999);

      return (
        assignment.status === "scheduled" &&
        today >= fromDate && // Hôm nay >= ngày bắt đầu
        today <= toDate // Hôm nay <= ngày kết thúc
      );
    });

    if (!todayShift) {
      return {
        EC: 3,
        EM: "No shift assignment found for today. You cannot check in without a scheduled shift",
      };
    }

    let isLate = false;
    let lateMinutes = 0;

    if (todayShift && todayShift.shiftType) {
      // Parse shift start time
      const shiftStartTime = parseTimeToToday(todayShift.shiftType.fromTime);
      const allowedLateMinute = todayShift.shiftType.allowedLateMinute || 0;

      // Tính số phút trễ
      const minutesDiff = calculateMinutesDifference(
        shiftStartTime,
        checkInTime,
      );

      if (minutesDiff > allowedLateMinute) {
        isLate = true;
        lateMinutes = minutesDiff - allowedLateMinute;
      }
    }

    const attendanceData = {
      staffId,
      checkIn: checkInTime,
      location,
      shiftAssignmentId: todayShift?._id || null,
      isLate,
      lateMinutes,
    };

    const attendance = await attendanceDAO.checkIn(attendanceData);

    return {
      EC: 0,
      EM: isLate
        ? `Checked in successfully. Late by ${lateMinutes} minutes`
        : "Checked in successfully",
      data: attendance,
    };
  } catch (error) {
    console.error("Service Error - checkInService:", error);
    return { EC: -1, EM: "Error checking in" };
  }
};

const checkOutService = async (staffId, location) => {
  try {
    // Kiểm tra đã check in hôm nay chưa
    const todayAttendance = await attendanceDAO.getTodayAttendance(staffId);
    if (!todayAttendance) {
      return { EC: 1, EM: "No check-in record found for today" };
    }

    // Kiểm tra đã check out chưa
    if (todayAttendance.checkOut) {
      return { EC: 2, EM: "Already checked out today" };
    }

    const checkOutTime = new Date();
    let isEarlyLeave = false;
    let earlyLeaveMinutes = 0;
    let workingHours = 0;

    // Tính số giờ làm việc
    workingHours =
      calculateMinutesDifference(todayAttendance.checkIn, checkOutTime) / 60;

    if (todayAttendance.shiftAssignmentId?.shiftType) {
      const shiftType = todayAttendance.shiftAssignmentId.shiftType;
      const shiftEndTime = parseTimeToToday(shiftType.toTime);
      const allowedEarlyLeaveMinute = shiftType.allowedEarlyLeaveMinute || 0;

      // Tính số phút về sớm
      const minutesDiff = calculateMinutesDifference(
        checkOutTime,
        shiftEndTime,
      );

      if (minutesDiff > allowedEarlyLeaveMinute) {
        isEarlyLeave = true;
        earlyLeaveMinutes = minutesDiff - allowedEarlyLeaveMinute;
      }
    }

    const checkOutData = {
      checkOut: checkOutTime,
      location,
      isEarlyLeave,
      earlyLeaveMinutes,
      workingHours: parseFloat(workingHours.toFixed(2)),
    };

    const updatedAttendance = await attendanceDAO.checkOut(
      todayAttendance._id,
      checkOutData,
    );

    return {
      EC: 0,
      EM: isEarlyLeave
        ? `Checked out successfully. Left early by ${earlyLeaveMinutes} minutes`
        : "Checked out successfully",
      data: updatedAttendance,
    };
  } catch (error) {
    console.error("Service Error - checkOutService:", error);
    return { EC: -1, EM: "Error checking out" };
  }
};

const getMyAttendancesService = async (staffId, startDate, endDate) => {
  try {
    const attendances = await attendanceDAO.getAttendancesByStaff(
      staffId,
      startDate,
      endDate,
    );
    return { EC: 0, EM: "Success", data: attendances };
  } catch (error) {
    console.error("Service Error - getMyAttendancesService:", error);
    return { EC: -1, EM: "Error fetching attendances" };
  }
};

const getAttendancesByDepartmentService = async (
  departmentId,
  startDate,
  endDate,
) => {
  try {
    const attendances = await attendanceDAO.getAttendancesByDepartment(
      departmentId,
      startDate,
      endDate,
    );
    return { EC: 0, EM: "Success", data: attendances };
  } catch (error) {
    console.error("Service Error - getAttendancesByDepartmentService:", error);
    return { EC: -1, EM: "Error fetching attendances" };
  }
};

const getAllAttendancesService = async (startDate, endDate) => {
  try {
    const attendances = await attendanceDAO.getAllAttendances(
      startDate,
      endDate,
    );
    return { EC: 0, EM: "Success", data: attendances };
  } catch (error) {
    console.error("Service Error - getAllAttendancesService:", error);
    return { EC: -1, EM: "Error fetching attendances" };
  }
};

const getTodayAttendanceService = async (staffId) => {
  try {
    const attendance = await attendanceDAO.getTodayAttendance(staffId);
    return { EC: 0, EM: "Success", data: attendance };
  } catch (error) {
    console.error("Service Error - getTodayAttendanceService:", error);
    return { EC: -1, EM: "Error fetching today attendance" };
  }
};

module.exports = {
  checkInService,
  checkOutService,
  getMyAttendancesService,
  getAttendancesByDepartmentService,
  getAllAttendancesService,
  getTodayAttendanceService,
};
