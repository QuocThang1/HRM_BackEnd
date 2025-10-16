const Department = require("../models/department");
const Staff = require("../models/staff");

const createDepartment = async (data) => {
    const session = await Department.startSession();
    session.startTransaction();
    try {
        const department = new Department(data);
        const savedDepartment = await department.save({ session });

        await Staff.findByIdAndUpdate(
            data.managerId,
            { departmentId: savedDepartment._id },
            { session }
        );

        await session.commitTransaction();
        session.endSession();
        return savedDepartment;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error creating department:", error);
        throw error;
    }
};

const getAvailableManagers = async () => {
    try {
        return await Staff.find({
            role: "manager",
            $or: [
                { departmentId: { $exists: false } },
                { departmentId: null }
            ]
        }).select("-password");
    } catch (error) {
        console.error("Error fetching available managers:", error);
        throw error;
    }
}

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
    const session = await Department.startSession();
    session.startTransaction();
    try {
        // Xóa department
        const deletedDepartment = await Department.findByIdAndDelete(id, { session });
        if (!deletedDepartment) {
            await session.abortTransaction();
            session.endSession();
            return null;
        }
        // Xóa departmentId trong staff liên quan
        await Staff.updateMany(
            { departmentId: id },
            { $unset: { departmentId: "" } },
            { session }
        );

        await session.commitTransaction();
        session.endSession();
        return deletedDepartment;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
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
    getAvailableManagers,
};
