const departmentShiftDAO = require("../DAO/departmentShiftDAO");
const departmentDAO = require("../DAO/departmentDAO");
const shiftTypeDAO = require("../DAO/shiftTypeDAO");
const shiftAssignmentDAO = require("../DAO/shiftAssignmentDAO");

const addShiftToDepartmentService = async (departmentId, shiftTypeId) => {
    try {
        // Kiểm tra department có tồn tại không
        const department = await departmentDAO.getDepartmentById(departmentId);
        if (!department) {
            return { EC: 1, EM: "Department not found" };
        }

        // Kiểm tra shiftType có tồn tại không
        const shiftType = await shiftTypeDAO.getShiftTypeById(shiftTypeId);
        if (!shiftType) {
            return { EC: 2, EM: "Shift type not found" };
        }

        // Kiểm tra ca làm đã được thêm vào department chưa
        const existingShift = await departmentShiftDAO.checkDepartmentShiftExists(
            departmentId,
            shiftTypeId
        );
        if (existingShift) {
            return { EC: 3, EM: "Shift type already added to this department" };
        }

        const departmentShift = await departmentShiftDAO.addShiftToDepartment(
            departmentId,
            shiftTypeId
        );

        return {
            EC: 0,
            EM: "Shift added to department successfully",
            data: departmentShift,
        };
    } catch (error) {
        console.error("Service Error - addShiftToDepartmentService:", error);
        return { EC: -1, EM: "Error adding shift to department" };
    }
};

const getDepartmentShiftsService = async (departmentId) => {
    try {
        // Nếu có departmentId thì lấy ca làm của department đó
        // Nếu không có thì lấy tất cả
        const shifts = departmentId
            ? await departmentShiftDAO.getDepartmentShifts(departmentId)
            : await departmentShiftDAO.getAllDepartmentShifts();

        return {
            EC: 0,
            EM: "Success",
            data: shifts,
        };
    } catch (error) {
        console.error("Service Error - getDepartmentShiftsService:", error);
        return { EC: -1, EM: "Error fetching department shifts" };
    }
};

const deleteDepartmentShiftService = async (id) => {
    try {
        const departmentShift = await departmentShiftDAO.getDepartmentShiftById(id);
        if (!departmentShift) {
            return { EC: 1, EM: "Department shift not found" };
        }

        const shiftInUse = await shiftAssignmentDAO.checkShiftInUse(
            departmentShift.department._id,
            departmentShift.shiftType._id
        );

        if (shiftInUse) {
            return {
                EC: 2,
                EM: "Cannot delete shift. There are staff members currently scheduled for this shift",
            };
        }

        await departmentShiftDAO.deleteDepartmentShift(id);

        return { EC: 0, EM: "Department shift deleted successfully" };
    } catch (error) {
        console.error("Service Error - deleteDepartmentShiftService:", error);
        return { EC: -1, EM: "Error deleting department shift" };
    }
};

const updateDepartmentShiftStatusService = async (id, isActive) => {
    try {
        const departmentShift = await departmentShiftDAO.getDepartmentShiftById(id);
        if (!departmentShift) {
            return { EC: 1, EM: "Department shift not found" };
        }

        if (!isActive) {
            const shiftInUse = await shiftAssignmentDAO.checkShiftInUse(
                departmentShift.department._id,
                departmentShift.shiftType._id
            );

            if (shiftInUse) {
                return {
                    EC: 2,
                    EM: "Cannot deactivate shift. There are staff members currently scheduled for this shift",
                };
            }
        }

        const updatedShift = await departmentShiftDAO.updateDepartmentShiftStatus(
            id,
            isActive
        );

        return {
            EC: 0,
            EM: "Department shift status updated successfully",
            data: updatedShift,
        };
    } catch (error) {
        console.error("Service Error - updateDepartmentShiftStatusService:", error);
        return { EC: -1, EM: "Error updating department shift status" };
    }
};

const getAvailableShiftsForDepartmentService = async (departmentId) => {
    try {
        const department = await departmentDAO.getDepartmentById(departmentId);
        if (!department) {
            return { EC: 1, EM: "Department not found" };
        }

        const availableShifts = await departmentShiftDAO.getAvailableShiftsForDepartment(
            departmentId
        );

        return {
            EC: 0,
            EM: "Success",
            data: availableShifts,
        };
    } catch (error) {
        console.error("Service Error - getAvailableShiftsForDepartmentService:", error);
        return { EC: -1, EM: "Error fetching available shifts" };
    }
};


module.exports = {
    addShiftToDepartmentService,
    getDepartmentShiftsService,
    deleteDepartmentShiftService,
    updateDepartmentShiftStatusService,
    getAvailableShiftsForDepartmentService
};