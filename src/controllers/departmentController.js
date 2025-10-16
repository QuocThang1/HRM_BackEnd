const { createDepartmentService, getDepartmentService, getDepartmentsService, updateDepartmentService, deleteDepartmentService, getAvailableManagersService } = require("../services/departmentService");

const createDepartment = async (req, res) => {
    try {
        const { departmentName, description, managerId } = req.body;
        const newDept = await createDepartmentService({ departmentName, description, managerId });
        return res.status(201).json({ EC: 0, EM: "Department created successfully", data: newDept });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ EC: 1, EM: "Error creating department" });
    }
};

const getDepartments = async (req, res) => {
    try {
        const departments = await getDepartmentsService();
        return res.status(200).json(departments);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ EC: 1, EM: "Error fetching departments" });
    }
};

const getDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const department = await getDepartmentService(id);
        return res.status(200).json(department);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ EC: 1, EM: "Error fetching department" });
    }
};

const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedDept = await updateDepartmentService(id, data);
        return res.status(200).json({ EC: 0, EM: "Department updated successfully", data: updatedDept });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ EC: 1, EM: "Error updating department" });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteDepartmentService(id);
        return res.status(200).json({ EC: 0, EM: "Department deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ EC: 1, EM: "Error deleting department" });
    }
};

const getAvailableManagers = async (req, res) => {
    try {
        const managers = await getAvailableManagersService();
        return res.status(200).json({ EC: 0, EM: "Success", data: managers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ EC: 1, EM: "Error fetching available managers" });
    }
};

module.exports = {
    createDepartment,
    getDepartments,
    getDepartment,
    updateDepartment,
    deleteDepartment,
    getAvailableManagers
};
