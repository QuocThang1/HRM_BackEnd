const {
    submitResignationService,
    getMyResignationsService,
    getResignationsByApproverService,
    getAllResignationsService,
    updateResignationStatusService,
    deleteResignationService,
} = require("../services/resignationService");

const submitResignation = async (req, res) => {
    try {
        const staffId = req.staff._id; // Lấy từ token
        const { reason, approvedBy } = req.body;

        const data = await submitResignationService(staffId, reason, approvedBy);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - submitResignation:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getMyResignations = async (req, res) => {
    try {
        const staffId = req.staff._id;

        const data = await getMyResignationsService(staffId);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getMyResignations:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getResignationsByApprover = async (req, res) => {
    try {
        const approverId = req.staff._id; // Admin đang đăng nhập

        const data = await getResignationsByApproverService(approverId);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getResignationsByApprover:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getAllResignations = async (req, res) => {
    try {
        const data = await getAllResignationsService();
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getAllResignations:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const updateResignationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;
        const adminId = req.staff._id;

        const data = await updateResignationStatusService(
            id,
            status,
            adminNote,
            adminId
        );
        res.json(data);
    } catch (error) {
        console.error("Controller Error - updateResignationStatus:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const deleteResignation = async (req, res) => {
    try {
        const { id } = req.params;
        const staffId = req.staff._id;

        const data = await deleteResignationService(id, staffId);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - deleteResignation:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

module.exports = {
    submitResignation,
    getMyResignations,
    getResignationsByApprover,
    getAllResignations,
    updateResignationStatus,
    deleteResignation,
};