const departmentDAO = require("../DAO/departmentDAO");
const staffDAO = require("../DAO/staffDAO");

const createDepartmentService = async (
  departmentName,
  description,
  managerId,
) => {
  try {
    const newDept = await departmentDAO.createDepartment({
      departmentName,
      description,
      managerId,
    });
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

    if (
      data.managerId &&
      data.managerId.toString() !== currentDept.managerId?.toString()
    ) {
      if (currentDept.managerId)
        await staffDAO.updateStaffByID(currentDept.managerId, {
          departmentId: null,
        });
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
    await departmentDAO.deleteDepartmentReviewsByDepartmentId(id);
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

const createDepartmentReviewService = async (reviewData) => {
  try {
    const exist = await departmentDAO.findByDeptAdminMonth(reviewData);
    if (exist)
      return {
        EC: 1,
        EM: "You already reviewed this department for this month",
        data: exist,
      };
    if (reviewData.score < 1 || reviewData.score > 10)
      return { EC: 2, EM: "Score must be between 1 and 10" };

    const newReview = await departmentDAO.createDepartmentReview(reviewData);
    return { EC: 0, EM: "Department reviewed successfully", data: newReview };
  } catch (error) {
    console.error("Service Error - createDepartmentReviewService:", error);
    return { EC: -1, EM: "Error creating department review" };
  }
};

const getDepartmentReviewsService = async (departmentId, month) => {
  try {
    const reviews = await departmentDAO.getDepartmentReviews(
      departmentId,
      month,
    );
    return {
      EC: 0,
      EM: "Fetched department reviews successfully",
      data: reviews,
    };
  } catch (error) {
    console.error("Service Error - getDepartmentReviewsService:", error);
    return { EC: -1, EM: "Error fetching department reviews" };
  }
};

const getDepartmentReviewsByAdminService = async (staffId, month) => {
  try {
    const reviews = await departmentDAO.getDepartmentReviewByAdmin(
      staffId,
      month,
    );
    return { EC: 0, EM: "Fetched reviews successfully", data: reviews };
  } catch (error) {
    console.error("Service Error - getDepartmentReviewsByAdminService:", error);
    return { EC: -1, EM: "Error fetching reviews" };
  }
};

const updateDepartmentReviewService = async (reviewId, updatedData) => {
  try {
    if (
      updatedData.score &&
      (updatedData.score < 1 || updatedData.score > 10)
    ) {
      return { EC: 2, EM: "Score must be between 1 and 10" };
    }
    const updated = await departmentDAO.updateDepartmentReview(
      reviewId,
      updatedData,
    );
    return { EC: 0, EM: "Updated successfully", data: updated };
  } catch (error) {
    console.error("Service Error - updateDepartmentReviewService:", error);
    return { EC: -1, EM: "Error updating review" };
  }
};

const deleteDepartmentReviewService = async (reviewId) => {
  try {
    await departmentDAO.deleteDepartmentReview(reviewId);
    return { EC: 0, EM: "Deleted successfully" };
  } catch (error) {
    console.error("Service Error - deleteDepartmentReviewService:", error);
    return { EC: -1, EM: "Error deleting review" };
  }
};

const getDepartmentByManagerService = async (managerId) => {
  try {
    const department = await departmentDAO.getDepartmentByManagerId(managerId);
    if (!department) {
      return { EC: 1, EM: "No department found for this manager" };
    }
    return { EC: 0, EM: "Success", data: department };
  } catch (error) {
    console.error("Service Error - getDepartmentByManagerService:", error);
    return { EC: -1, EM: "Error fetching department" };
  }
};

module.exports = {
  createDepartmentService,
  getDepartmentsService,
  getDepartmentService,
  updateDepartmentService,
  deleteDepartmentService,
  getAvailableManagersService,
  createDepartmentReviewService,
  getDepartmentReviewsService,
  getDepartmentReviewsByAdminService,
  updateDepartmentReviewService,
  deleteDepartmentReviewService,
  getDepartmentByManagerService,
};
