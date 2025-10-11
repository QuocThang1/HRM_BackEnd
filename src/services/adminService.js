const staffDAO = require("../DAO/staffDAO.js");

const detailEmployeeService = async (staffId) => {
    try {
        const staff = await staffDAO.getStaffByID(staffId);
        if (!staff) {
            return { EC: 1, EM: "Staff not found" };
        }

        return {
            EC: 0,
            EM: "Success",
            staff,
        };
    } catch (error) {
        console.error("Error in detailEmployeeService:", error);
        return { EC: 2, EM: "Server error" };
    }
};

const updateEmployeeService = async (staffId, updateData) => {
    try {
        const updatedStaff = await staffDAO.updateStaffByID(staffId, updateData);
        if (!updatedStaff) {
            return { success: false, message: "Staff not found" };
        }
        return { success: true, staff: updatedStaff };
    } catch (error) {
        console.error("Error in updateStaffService:", error);
        return { success: false, message: "Error updating staff" };
    }
};

const deleteEmployeeService = async (staffId) => {
    try {
        const deletedStaff = await staffDAO.deleteStaffByID(staffId);
        if (!deletedStaff) {
            return { success: false, message: "Staff not found" };
        }
        return { success: true, staff: deletedStaff };
    } catch (error) {
        console.error("Error in deleteStaffService:", error);
        return { success: false, message: "Error deleting staff" };
    }
};


module.exports = {
    detailEmployeeService,
    updateEmployeeService,
    deleteEmployeeService,
};