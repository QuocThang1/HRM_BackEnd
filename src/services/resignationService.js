const resignationDAO = require("../DAO/resignationDAO");
const staffDAO = require("../DAO/staffDAO");

const submitResignationService = async (staffId, reason, approvedBy) => {
    try {
        // Kiểm tra staff có tồn tại không
        const staff = await staffDAO.getStaffByID(staffId);
        if (!staff) {
            return { EC: 1, EM: "Staff not found" };
        }

        // Kiểm tra admin approver có tồn tại không
        const admin = await staffDAO.getStaffByID(approvedBy);
        if (!admin) {
            return { EC: 2, EM: "Admin approver not found" };
        }

        // Kiểm tra admin có phải role admin không
        if (admin.role !== "admin") {
            return { EC: 3, EM: "Approver must be an admin" };
        }

        // Kiểm tra đã có đơn pending chưa
        const pendingResignation = await resignationDAO.checkPendingResignation(staffId);
        if (pendingResignation) {
            return {
                EC: 4,
                EM: "You already have a pending resignation request",
            };
        }

        const resignationData = {
            staffId,
            reason,
            approvedBy,
            status: "pending",
        };

        const resignation = await resignationDAO.createResignation(resignationData);

        return {
            EC: 0,
            EM: "Resignation request submitted successfully",
            data: resignation,
        };
    } catch (error) {
        console.error("Service Error - submitResignationService:", error);
        return { EC: -1, EM: "Error submitting resignation" };
    }
};

const getMyResignationsService = async (staffId) => {
    try {
        const resignations = await resignationDAO.getResignationsByStaff(staffId);
        return { EC: 0, EM: "Success", data: resignations };
    } catch (error) {
        console.error("Service Error - getMyResignationsService:", error);
        return { EC: -1, EM: "Error fetching resignations" };
    }
};

const getResignationsByApproverService = async (approverId) => {
    try {
        // Kiểm tra admin có tồn tại không
        const admin = await staffDAO.getStaffByID(approverId);
        if (!admin) {
            return { EC: 1, EM: "Admin not found" };
        }

        // Kiểm tra có phải admin không
        if (admin.role !== "admin") {
            return { EC: 2, EM: "Only admin can view resignation requests" };
        }

        const resignations = await resignationDAO.getResignationsByApprover(approverId);
        return { EC: 0, EM: "Success", data: resignations };
    } catch (error) {
        console.error("Service Error - getResignationsByApproverService:", error);
        return { EC: -1, EM: "Error fetching resignations" };
    }
};

const getAllResignationsService = async () => {
    try {
        const resignations = await resignationDAO.getAllResignations();
        return { EC: 0, EM: "Success", data: resignations };
    } catch (error) {
        console.error("Service Error - getAllResignationsService:", error);
        return { EC: -1, EM: "Error fetching resignations" };
    }
};

const updateResignationStatusService = async (
    id,
    status,
    adminNote,
    adminId
) => {
    try {
        const resignation = await resignationDAO.getResignationById(id);
        if (!resignation) {
            return { EC: 1, EM: "Resignation not found" };
        }

        // Kiểm tra admin có quyền approve không (phải là người được chọn)
        if (resignation.approvedBy._id.toString() !== adminId) {
            return {
                EC: 2,
                EM: "You are not authorized to process this resignation request",
            };
        }

        // Kiểm tra nếu đã approved thì không cho sửa nữa
        if (resignation.status === "approved") {
            return {
                EC: 3,
                EM: "Cannot modify an approved resignation request",
            };
        }

        // Nếu chuyển sang approved, xóa staff khỏi hệ thống
        if (status === "approved") {
            // Xóa staff
            await staffDAO.deleteStaffByID(resignation.staffId._id);

            // Cập nhật status
            const updatedResignation = await resignationDAO.updateResignationStatus(
                id,
                status,
                adminNote
            );

            return {
                EC: 0,
                EM: "Resignation approved. Staff has been removed from the system",
                data: updatedResignation,
            };
        }

        // Nếu chuyển sang rejected hoặc pending
        const updatedResignation = await resignationDAO.updateResignationStatus(
            id,
            status,
            adminNote
        );

        return {
            EC: 0,
            EM: `Resignation status updated to ${status}`,
            data: updatedResignation,
        };
    } catch (error) {
        console.error("Service Error - updateResignationStatusService:", error);
        return { EC: -1, EM: "Error updating resignation status" };
    }
};

const deleteResignationService = async (id, currentUserId) => {
    try {
        const resignation = await resignationDAO.getResignationById(id);
        if (!resignation) {
            return { EC: 1, EM: "Resignation not found" };
        }

        const staffId = resignation.staffId?._id?.toString() || null;
        const isStaffOwner = staffId && staffId === currentUserId;
        const isApprover = resignation.approvedBy._id.toString() === currentUserId;

        if (!isStaffOwner && !isApprover) {
            return {
                EC: 2,
                EM: "You are not authorized to delete this resignation"
            };
        }

        if (isStaffOwner) {
            if (resignation.status === "pending" || resignation.status === "rejected") {
                await resignationDAO.deleteResignation(id);
                return {
                    EC: 0,
                    EM: "Resignation deleted successfully"
                };
            } else {
                return {
                    EC: 3,
                    EM: "You can only delete resignations with pending or rejected status"
                };
            }
        }

        if (isApprover) {
            if (resignation.status === "rejected" || resignation.status === "approved") {
                await resignationDAO.deleteResignation(id);
                return {
                    EC: 0,
                    EM: "Resignation deleted successfully"
                };
            } else {
                return {
                    EC: 4,
                    EM: "Admin can only delete resignations with rejected or approved status"
                };
            }
        }

        return {
            EC: 5,
            EM: "Unable to delete resignation"
        };
    } catch (error) {
        console.error("Service Error - deleteResignationService:", error);
        return { EC: -1, EM: "Error deleting resignation" };
    }
};

module.exports = {
    submitResignationService,
    getMyResignationsService,
    getResignationsByApproverService,
    getAllResignationsService,
    updateResignationStatusService,
    deleteResignationService,
};