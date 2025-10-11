const departmentDAO = require("../DAO/departmentDAO");

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

module.exports = {
    createDepartmentService,
    getDepartmentsService,
    getDepartmentService,
    updateDepartmentService,
    deleteDepartmentService,
};
