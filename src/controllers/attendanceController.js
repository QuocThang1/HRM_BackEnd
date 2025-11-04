const {
    checkInService,
    checkOutService,
    getMyAttendancesService,
    getAttendancesByDepartmentService,
    getAllAttendancesService,
    getTodayAttendanceService,
} = require("../services/attendanceService");

const checkIn = async (req, res) => {
    try {
        const staffId = req.staff._id; // Lấy từ token
        const { location } = req.body;

        const data = await checkInService(staffId, location);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - checkIn:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const checkOut = async (req, res) => {
    try {
        const staffId = req.staff._id; // Lấy từ token
        const { location } = req.body;

        const data = await checkOutService(staffId, location);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - checkOut:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getMyAttendances = async (req, res) => {
    try {
        const staffId = req.staff._id;
        const { startDate, endDate } = req.query;

        const data = await getMyAttendancesService(staffId, startDate, endDate);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getMyAttendances:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getAttendancesByDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const { startDate, endDate } = req.query;

        const data = await getAttendancesByDepartmentService(
            departmentId,
            startDate,
            endDate
        );
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getAttendancesByDepartment:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getAllAttendances = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const data = await getAllAttendancesService(startDate, endDate);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getAllAttendances:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getTodayAttendance = async (req, res) => {
    try {
        const staffId = req.staff._id;

        const data = await getTodayAttendanceService(staffId);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getTodayAttendance:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

module.exports = {
    checkIn,
    checkOut,
    getMyAttendances,
    getAttendancesByDepartment,
    getAllAttendances,
    getTodayAttendance,
};