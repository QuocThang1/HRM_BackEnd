const departmentDAO = require("../DAO/departmentDAO");
const staffDAO = require("../DAO/staffDAO");

const createDepartmentService = async ({ departmentName, description, managerId }) => {
    return await departmentDAO.createDepartment({ departmentName, description, managerId });
};

const getDepartmentsService = async () => {
    return await departmentDAO.getAllDepartments();
};

const getDepartmentService = async (id) => {
    return await departmentDAO.getDepartmentById(id);
};

const updateDepartmentService = async (id, data) => {
    return await departmentDAO.updateDepartment(id, data);
};

const deleteDepartmentService = async (id) => {
    return await departmentDAO.deleteDepartment(id);
};

const getAvailableManagersService = async () => {
    return await departmentDAO.getAvailableManagers();
};


module.exports = {
    createDepartmentService,
    getDepartmentsService,
    getDepartmentService,
    updateDepartmentService,
    deleteDepartmentService,
    getAvailableManagersService
};
