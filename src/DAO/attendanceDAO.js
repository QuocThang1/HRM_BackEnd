const Attendance = require("../models/attendance");

class AttendanceDAO {
    async checkIn(data) {
        try {
            const attendance = new Attendance(data);
            return await attendance.save();
        } catch (error) {
            console.error("DAO Error - checkIn:", error);
            throw error;
        }
    }

    async checkOut(attendanceId, checkOutData) {
        try {
            return await Attendance.findByIdAndUpdate(
                attendanceId,
                checkOutData,
                { new: true, runValidators: true }
            )
                .populate("staffId", "personalInfo.fullName personalInfo.email")
                .populate({
                    path: "shiftAssignmentId",
                    populate: {
                        path: "shiftType",
                    },
                });
        } catch (error) {
            console.error("DAO Error - checkOut:", error);
            throw error;
        }
    }

    async getTodayAttendance(staffId) {
        try {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            return await Attendance.findOne({
                staffId,
                checkIn: { $gte: startOfDay, $lte: endOfDay },
            })
                .populate("staffId", "personalInfo.fullName personalInfo.email")
                .populate({
                    path: "shiftAssignmentId",
                    populate: {
                        path: "shiftType",
                    },
                });
        } catch (error) {
            console.error("DAO Error - getTodayAttendance:", error);
            throw error;
        }
    }

    async getAttendancesByStaff(staffId, startDate, endDate) {
        try {
            const query = { staffId };

            if (startDate || endDate) {
                query.checkIn = {};
                if (startDate) query.checkIn.$gte = new Date(startDate);
                if (endDate) query.checkIn.$lte = new Date(endDate);
            }

            return await Attendance.find(query)
                .populate("staffId", "personalInfo.fullName personalInfo.email")
                .populate({
                    path: "shiftAssignmentId",
                    populate: {
                        path: "shiftType",
                    },
                })
                .sort({ checkIn: -1 });
        } catch (error) {
            console.error("DAO Error - getAttendancesByStaff:", error);
            throw error;
        }
    }

    async getAttendancesByDepartment(departmentId, startDate, endDate) {
        try {
            const Staff = require("../models/staff");
            const staffs = await Staff.find({ departmentId }).select("_id");
            const staffIds = staffs.map((s) => s._id);

            const query = { staffId: { $in: staffIds } };

            if (startDate || endDate) {
                query.checkIn = {};
                if (startDate) query.checkIn.$gte = new Date(startDate);
                if (endDate) query.checkIn.$lte = new Date(endDate);
            }

            return await Attendance.find(query)
                .populate("staffId", "personalInfo.fullName personalInfo.email departmentId")
                .populate({
                    path: "shiftAssignmentId",
                    populate: {
                        path: "shiftType",
                    },
                })
                .sort({ checkIn: -1 });
        } catch (error) {
            console.error("DAO Error - getAttendancesByDepartment:", error);
            throw error;
        }
    }

    async getAllAttendances(startDate, endDate) {
        try {
            const query = {};

            if (startDate || endDate) {
                query.checkIn = {};
                if (startDate) query.checkIn.$gte = new Date(startDate);
                if (endDate) query.checkIn.$lte = new Date(endDate);
            }

            return await Attendance.find(query)
                .populate("staffId", "personalInfo.fullName personalInfo.email departmentId")
                .populate({
                    path: "shiftAssignmentId",
                    populate: [
                        { path: "shiftType" },
                        { path: "department", select: "departmentName" },
                    ],
                })
                .sort({ checkIn: -1 });
        } catch (error) {
            console.error("DAO Error - getAllAttendances:", error);
            throw error;
        }
    }

    async getAttendanceById(id) {
        try {
            return await Attendance.findById(id)
                .populate("staffId", "personalInfo.fullName personalInfo.email")
                .populate({
                    path: "shiftAssignmentId",
                    populate: {
                        path: "shiftType",
                    },
                });
        } catch (error) {
            console.error("DAO Error - getAttendanceById:", error);
            throw error;
        }
    }

    async getAttendancesByStaffAndDateRange(staffId, startDate, endDate) {
        try {
            return await Attendance.find({
                staffId,
                checkIn: {
                    $gte: startDate,
                    $lte: endDate,
                },
                workingHours: { $exists: true, $ne: null },
            });
        } catch (error) {
            console.error("DAO Error - getAttendancesByStaffAndDateRange:", error);
            throw error;
        }
    }
}

module.exports = new AttendanceDAO();