const {
    createShiftAssignmentService,
    getAllShiftAssignmentsService,
    getShiftAssignmentService,
    updateShiftAssignmentService,
    deleteShiftAssignmentService,
    getShiftAssignmentByStaffIdService,
} = require("../services/shiftAssignmentService");

const createShiftAssignment = async (req, res) => {
    try {
        const { staff, shiftType, department, fromDate, toDate } = req.body;
        const createdBy = req.staff._id; // Lấy từ middleware (manager đang đăng nhập)

        const data = await createShiftAssignmentService(
            { staff, shiftType, department, fromDate, toDate },
            createdBy
        );

        res.json(data);
    } catch (error) {
        console.error("Controller Error - createShiftAssignment:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getAllShiftAssignments = async (req, res) => {
    try {
        const { departmentId, staffId } = req.query;
        const data = await getAllShiftAssignmentsService(departmentId, staffId);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getAllShiftAssignments:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getShiftAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await getShiftAssignmentService(id);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getShiftAssignment:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getShiftAssignmentByStaffId = async (req, res) => {
    try {
        const staffId = req.staff._id; // Lấy từ middleware
        const data = await getShiftAssignmentByStaffIdService(staffId);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getShiftAssignmentByStaffId:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const updateShiftAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const data = await updateShiftAssignmentService(id, updateData);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - updateShiftAssignment:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const deleteShiftAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await deleteShiftAssignmentService(id);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - deleteShiftAssignment:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};


module.exports = {
    createShiftAssignment,
    getAllShiftAssignments,
    getShiftAssignment,
    updateShiftAssignment,
    deleteShiftAssignment,
    getShiftAssignmentByStaffId,
};