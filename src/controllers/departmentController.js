const {
    createDepartmentService,
    getDepartmentsService,
    getDepartmentService,
    updateDepartmentService,
    deleteDepartmentService,
    getAvailableManagersService
} = require("../services/departmentService");

const createDepartment = async (req, res) => {
    try {
        const { departmentName, description, managerId } = req.body;
        const data = await createDepartmentService(departmentName, description, managerId);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - createDepartment:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getDepartments = async (req, res) => {
    try {
        const data = await getDepartmentsService();
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getDepartments:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await getDepartmentService(id);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getDepartment:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { departmentName, description, managerId } = req.body;
        const data = await updateDepartmentService(id, { departmentName, description, managerId });
        res.json(data);
    } catch (error) {
        console.error("Controller Error - updateDepartment:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await deleteDepartmentService(id);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - deleteDepartment:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getAvailableManagers = async (req, res) => {
    try {
        const data = await getAvailableManagersService();
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getAvailableManagers:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

module.exports = {
    createDepartment,
    getDepartments,
    getDepartment,
    updateDepartment,
    deleteDepartment,
    getAvailableManagers,
};
