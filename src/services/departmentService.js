const departmentDAO = require("../DAO/departmentDAO");
const staffDAO = require("../DAO/staffDAO");

const createDepartmentService = async (departmentName, description, managerId) => {
    try {
        const newDept = await departmentDAO.createDepartment({ departmentName, description, managerId });
        if (managerId) {
            await staffDAO.updateStaffByID(managerId, { departmentId: newDept._id });
        }
        return { EC: 0, EM: "Department created successfully", data: newDept };
    } catch (error) {
        console.error("Service Error - createDepartmentService:", error);
        return { EC: -1, EM: "Error creating department" };
    }
};

const getDepartmentsService = async () => {
    try {
        const departments = await departmentDAO.getAllDepartments();
        return { EC: 0, EM: "Success", data: departments };
    } catch (error) {
        console.error("Service Error - getDepartmentsService:", error);
        return { EC: -1, EM: "Error fetching departments" };
    }
};

const getDepartmentService = async (id) => {
    try {
        const department = await departmentDAO.getDepartmentById(id);
        if (!department) return { EC: 1, EM: "Department not found" };
        return { EC: 0, EM: "Success", data: department };
    } catch (error) {
        console.error("Service Error - getDepartmentService:", error);
        return { EC: -1, EM: "Error fetching department" };
    }
};

const updateDepartmentService = async (id, data) => {
    try {
        const currentDept = await departmentDAO.getDepartmentById(id);
        if (!currentDept) return { EC: 1, EM: "Department not found" };

        if (data.managerId && data.managerId.toString() !== currentDept.managerId?.toString()) {
            if (currentDept.managerId) await staffDAO.updateStaffByID(currentDept.managerId, { departmentId: null });
            await staffDAO.updateStaffByID(data.managerId, { departmentId: id });
        }

        const updatedDept = await departmentDAO.updateDepartment(id, data);
        return { EC: 0, EM: "Department updated successfully", data: updatedDept };
    } catch (error) {
        console.error("Service Error - updateDepartmentService:", error);
        return { EC: -1, EM: "Error updating department" };
    }
};

const deleteDepartmentService = async (id) => {
    try {
        const department = await departmentDAO.getDepartmentById(id);
        if (!department) return { EC: 1, EM: "Department not found" };

        await departmentDAO.removeDepartmentFromStaffs(id);
        await departmentDAO.deleteDepartment(id);

        return { EC: 0, EM: "Department deleted successfully" };
    } catch (error) {
        console.error("Service Error - deleteDepartmentService:", error);
        return { EC: -1, EM: "Error deleting department" };
    }
};

const getAvailableManagersService = async () => {
    try {
        const managers = await departmentDAO.getAvailableManagers();
        return { EC: 0, EM: "Success", data: managers };
    } catch (error) {
        console.error("Service Error - getAvailableManagersService:", error);
        return { EC: -1, EM: "Error fetching available managers" };
    }
};

module.exports = {
    createDepartmentService,
    getDepartmentsService,
    getDepartmentService,
    updateDepartmentService,
    deleteDepartmentService,
    getAvailableManagersService,
};
