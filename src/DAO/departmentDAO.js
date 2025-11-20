const Department = require("../models/department");
const Staff = require("../models/staff");
const DepartmentReview = require("../models/departmentReview");
1;

class DepartmentDAO {
  async createDepartment(data) {
    try {
      const department = new Department(data);
      return await department.save();
    } catch (error) {
      console.error("DAO Error - createDepartment:", error);
      throw error;
    }
  }

  async getAllDepartments() {
    try {
      return await Department.find().populate(
        "managerId",
        "personalInfo.fullName personalInfo.email role",
      );
    } catch (error) {
      console.error("DAO Error - getAllDepartments:", error);
      throw error;
    }
  }

  async getDepartmentById(id) {
    try {
      return await Department.findById(id).populate(
        "managerId",
        "personalInfo.fullName personalInfo.email role",
      );
    } catch (error) {
      console.error("DAO Error - getDepartmentById:", error);
      throw error;
    }
  }

  async updateDepartment(id, data) {
    try {
      return await Department.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      }).populate("managerId", "personalInfo.fullName personalInfo.email role");
    } catch (error) {
      console.error("DAO Error - updateDepartment:", error);
      throw error;
    }
  }

  async deleteDepartment(id) {
    try {
      return await Department.findByIdAndDelete(id);
    } catch (error) {
      console.error("DAO Error - deleteDepartment:", error);
      throw error;
    }
  }

  async getAvailableManagers() {
    try {
      return await Staff.find({
        role: "manager",
        $or: [{ departmentId: { $exists: false } }, { departmentId: null }],
      }).select("personalInfo.fullName personalInfo.email role");
    } catch (error) {
      console.error("DAO Error - getAvailableManagers:", error);
      throw error;
    }
  }

  async removeDepartmentFromStaffs(departmentId) {
    try {
      return await Staff.updateMany(
        { departmentId },
        { $unset: { departmentId: "" } },
      );
    } catch (error) {
      console.error("DAO Error - removeDepartmentFromStaffs:", error);
      throw error;
    }
  }

  async createDepartmentReview(data) {
    try {
      const newReview = new DepartmentReview({
        departmentId: data.departmentId,
        adminId: data.staffId, // staff chính là người đánh giá
        month: data.month,
        score: data.score,
        comments: data.comments || null,
        createdAt: new Date(),
      });
      return await newReview.save();
    } catch (error) {
      console.error("DAO Error - createDepartmentReview:", error);
      throw error;
    }
  }

  async getDepartmentReviews(departmentId, month) {
    try {
      const filter = {};
      if (departmentId) filter.departmentId = departmentId;
      if (month) filter.month = month;

      return await DepartmentReview.find(filter)
        .populate("departmentId", "departmentName")
        .populate("adminId", "personalInfo.fullName personalInfo.email")
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error("DAO Error - getDepartmentReviews:", error);
      throw error;
    }
  }

  async findByDeptAdminMonth(data) {
    try {
      return await DepartmentReview.findOne({
        departmentId: data.departmentId,
        adminId: data.staffId,
        month: data.month,
      });
    } catch (error) {
      console.error("DAO Error - findByDeptAdminMonth:", error);
      throw error;
    }
  }

  async getDepartmentReviewByAdmin(staffId, month) {
    try {
      const filter = { adminId: staffId };
      if (month) filter.month = month;
      return await DepartmentReview.find(filter)
        .populate("departmentId", "departmentName")
        .populate("adminId", "personalInfo.fullName personalInfo.email")
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error("DAO Error - getByAdmin:", error);
      throw error;
    }
  }

  async updateDepartmentReview(reviewId, updatedData) {
    try {
      return await DepartmentReview.findByIdAndUpdate(reviewId, updatedData, {
        new: true,
      });
    } catch (error) {
      console.error("DAO Error - updateReview:", error);
      throw error;
    }
  }

  async deleteDepartmentReview(reviewId) {
    try {
      return await DepartmentReview.findByIdAndDelete(reviewId);
    } catch (error) {
      console.error("DAO Error - deleteReview:", error);
      throw error;
    }
  }

  async deleteDepartmentReviewsByDepartmentId(departmentId) {
    try {
      return await DepartmentReview.deleteMany({ departmentId });
    } catch (error) {
      console.error(
        "DAO Error - deleteDepartmentReviewsByDepartmentId:",
        error,
      );
      throw error;
    }
  }
}

module.exports = new DepartmentDAO();
