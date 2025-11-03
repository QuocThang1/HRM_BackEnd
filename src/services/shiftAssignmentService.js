const shiftAssignmentDAO = require("../DAO/shiftAssignmentDAO");
const staffDAO = require("../DAO/staffDAO");
const departmentShiftDAO = require("../DAO/departmentShiftDAO");
const departmentDAO = require("../DAO/departmentDAO");

const createShiftAssignmentService = async (assignmentData, createdBy) => {
    try {
        const { staff, shiftType, department, fromDate, toDate } = assignmentData;

        // Kiểm tra staff có tồn tại không
        const staffExists = await staffDAO.getStaffByID(staff);
        if (!staffExists) {
            return { EC: 1, EM: "Staff not found" };
        }

        // Kiểm tra staff có thuộc department này không
        if (staffExists.departmentId?.toString() !== department) {
            return { EC: 2, EM: "Staff does not belong to this department" };
        }

        // Kiểm tra department có tồn tại không
        const departmentExists = await departmentDAO.getDepartmentById(department);
        if (!departmentExists) {
            return { EC: 3, EM: "Department not found" };
        }

        // Kiểm tra shiftType có được thêm vào department này chưa
        const departmentShiftExists = await departmentShiftDAO.checkDepartmentShiftExists(
            department,
            shiftType
        );
        if (!departmentShiftExists) {
            return { EC: 4, EM: "Shift type not available in this department" };
        }

        // Kiểm tra fromDate phải trước toDate
        if (new Date(fromDate) >= new Date(toDate)) {
            return { EC: 5, EM: "From date must be before to date" };
        }

        // Kiểm tra staff đã có ca làm nào trong khoảng thời gian này chưa
        const conflictingAssignment = await shiftAssignmentDAO.checkStaffAvailability(
            staff,
            fromDate,
            toDate
        );
        if (conflictingAssignment) {
            return {
                EC: 6,
                EM: "Staff already has a shift assignment in this time period",
                data: conflictingAssignment,
            };
        }

        // Tạo shift assignment
        const shiftAssignment = await shiftAssignmentDAO.createShiftAssignment({
            staff,
            shiftType,
            department,
            fromDate,
            toDate,
            status: "scheduled",
            createdBy,
        });

        return {
            EC: 0,
            EM: "Shift assignment created successfully",
            data: shiftAssignment,
        };
    } catch (error) {
        console.error("Service Error - createShiftAssignmentService:", error);
        return { EC: -1, EM: "Error creating shift assignment" };
    }
};

const getAllShiftAssignmentsService = async (departmentId, staffId) => {
    try {
        let assignments;

        if (departmentId) {
            assignments = await shiftAssignmentDAO.getShiftAssignmentsByDepartment(
                departmentId
            );
        } else if (staffId) {
            assignments = await shiftAssignmentDAO.getShiftAssignmentsByStaff(staffId);
        } else {
            assignments = await shiftAssignmentDAO.getAllShiftAssignments();
        }

        return { EC: 0, EM: "Success", data: assignments };
    } catch (error) {
        console.error("Service Error - getAllShiftAssignmentsService:", error);
        return { EC: -1, EM: "Error fetching shift assignments" };
    }
};

const getShiftAssignmentService = async (id) => {
    try {
        const assignment = await shiftAssignmentDAO.getShiftAssignmentById(id);
        if (!assignment) {
            return { EC: 1, EM: "Shift assignment not found" };
        }
        return { EC: 0, EM: "Success", data: assignment };
    } catch (error) {
        console.error("Service Error - getShiftAssignmentService:", error);
        return { EC: -1, EM: "Error fetching shift assignment" };
    }
};

const getShiftAssignmentByStaffIdService = async (staffId) => {
    try {
        const assignments = await shiftAssignmentDAO.getShiftAssignmentsByStaff(staffId);
        return { EC: 0, EM: "Success", data: assignments };
    } catch (error) {
        console.error("Service Error - getShiftAssignmentByStaffIdService:", error);
        return { EC: -1, EM: "Error fetching shift assignments for staff" };
    }
};

const updateShiftAssignmentService = async (id, updateData) => {
    try {
        const assignment = await shiftAssignmentDAO.getShiftAssignmentById(id);
        if (!assignment) {
            return { EC: 1, EM: "Shift assignment not found" };
        }

        // Nếu cập nhật thời gian, kiểm tra conflict
        if (updateData.fromDate || updateData.toDate) {
            const fromDate = updateData.fromDate || assignment.fromDate;
            const toDate = updateData.toDate || assignment.toDate;

            if (new Date(fromDate) >= new Date(toDate)) {
                return { EC: 2, EM: "From date must be before to date" };
            }

            const conflictingAssignment = await shiftAssignmentDAO.checkStaffAvailability(
                assignment.staff._id,
                fromDate,
                toDate
            );

            // Kiểm tra conflict nhưng bỏ qua chính assignment đang update
            if (conflictingAssignment) {
                return {
                    EC: 3,
                    EM: "Staff already has a shift assignment in this time period",
                };
            }
        }

        const updatedAssignment = await shiftAssignmentDAO.updateShiftAssignment(
            id,
            updateData
        );

        return {
            EC: 0,
            EM: "Shift assignment updated successfully",
            data: updatedAssignment,
        };
    } catch (error) {
        console.error("Service Error - updateShiftAssignmentService:", error);
        return { EC: -1, EM: "Error updating shift assignment" };
    }
};

const deleteShiftAssignmentService = async (id) => {
    try {
        const assignment = await shiftAssignmentDAO.getShiftAssignmentById(id);
        if (!assignment) {
            return { EC: 1, EM: "Shift assignment not found" };
        }

        await shiftAssignmentDAO.deleteShiftAssignment(id);
        return { EC: 0, EM: "Shift assignment deleted successfully" };
    } catch (error) {
        console.error("Service Error - deleteShiftAssignmentService:", error);
        return { EC: -1, EM: "Error deleting shift assignment" };
    }
};

module.exports = {
    createShiftAssignmentService,
    getAllShiftAssignmentsService,
    getShiftAssignmentService,
    updateShiftAssignmentService,
    deleteShiftAssignmentService,
    getShiftAssignmentByStaffIdService,
};