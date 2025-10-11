const Department = require("../models/department");

const createDepartment = async (data) => {
    try {
        const department = new Department(data);
        return await department.save();
    } catch (error) {
        console.error("Error creating department:", error);
        throw error;
    }
};

const getAllDepartments = async () => {
    try {
        return await Department.find().populate("managerId", "personalInfo.fullName email role");
    } catch (error) {
        console.error("Error fetching departments:", error);
        throw error;
    }
};

const getDepartmentById = async (id) => {
    try {
        return await Department.findById(id).populate("managerId", "personalInfo.fullName email role");
    } catch (error) {
        console.error("Error fetching department by id:", error);
        throw error;
    }
};

const updateDepartment = async (id, data) => {
    try {
        return await Department.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    } catch (error) {
        console.error("Error updating department:", error);
        throw error;
    }
};

const deleteDepartment = async (id) => {
    try {
        return await Department.findByIdAndDelete(id);
    } catch (error) {
        console.error("Error deleting department:", error);
        throw error;
    }
};

module.exports = {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
};
