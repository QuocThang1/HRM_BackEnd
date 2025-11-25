const Staff = require("../models/staff");
const Department = require("../models/department");

class StaffDAO {
  async getAllStaff(role) {
    try {
      const filter = {};
      if (role) {
        filter.role = role;
      }
      return await Staff.find(filter).select("-password");
    } catch (error) {
      console.error("DAO Error - getAllStaff:", error);
      throw error;
    }
  }

  async getStaffByID(staffId) {
    try {
      return await Staff.findById(staffId).select("-password");
    } catch (error) {
      console.error("DAO Error - getStaffByID:", error);
      throw error;
    }
  }

  async deleteStaffByID(staffId) {
    try {
      const deletedStaff = await Staff.findByIdAndDelete(staffId);
      if (deletedStaff) {
        await Department.updateMany(
          { managerId: staffId },
          { $unset: { managerId: "" } },
        );
      }
      return deletedStaff;
    } catch (error) {
      console.error("DAO Error - deleteStaffByID:", error);
      throw error;
    }
  }

  async updateStaffByID(staffId, updateData) {
    try {
      return await Staff.findByIdAndUpdate(staffId, updateData, {
        new: true,
      }).select("-password");
    } catch (error) {
      console.error("DAO Error - updateStaffByID:", error);
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      return await Staff.findOne({ "personalInfo.email": email });
    } catch (error) {
      console.error("DAO Error - findByEmail:", error);
      throw error;
    }
  }

  async setResetTokenByEmail(email, token, expires) {
    try {
      const update = { resetPasswordToken: token };
      if (expires === null) {
        update.resetPasswordExpires = null;
      } else if (expires !== undefined) {
        // ensure expires is stored as Date
        update.resetPasswordExpires =
          expires instanceof Date ? expires : new Date(expires);
      }
      return await Staff.findOneAndUpdate(
        { "personalInfo.email": email },
        update,
        { new: true },
      );
    } catch (error) {
      console.error("DAO Error - setResetTokenByEmail:", error);
      throw error;
    }
  }

  async findByResetToken(token) {
    try {
      return await Staff.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });
    } catch (error) {
      console.error("DAO Error - findByResetToken:", error);
      throw error;
    }
  }

  async updatePasswordById(staffId, hashedPassword) {
    try {
      return await Staff.findByIdAndUpdate(
        staffId,
        {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
        { new: true },
      );
    } catch (error) {
      console.error("DAO Error - updatePasswordById:", error);
      throw error;
    }
  }

  async createStaff(data) {
    try {
      const staff = new Staff(data);
      return await staff.save();
    } catch (error) {
      console.error("DAO Error - createStaff:", error.message);
      // Log full error object to help diagnose MongoDB validation failures
      try {
        console.error(
          "Full error:",
          JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
        );
      } catch (jsonErr) {
        console.error("Could not stringify error object:", jsonErr);
        console.error(error);
      }
      if (error.errInfo) {
        try {
          console.error(
            "Validation details:",
            JSON.stringify(error.errInfo, null, 2),
          );
        } catch (e) {
          console.error("Could not stringify errInfo:", e, error.errInfo);
        }
      }
      throw error;
    }
  }

  async updateProfile(staffId, updateData) {
    try {
      return await Staff.findByIdAndUpdate(staffId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");
    } catch (error) {
      console.error("DAO Error - updateProfile:", error);
      throw error;
    }
  }

  async getStaffByDepartmentId(departmentId) {
    try {
      return await Staff.find({ departmentId }).select("personalInfo role _id");
    } catch (error) {
      console.error("DAO Error - getStaffByDepartmentId:", error);
      throw error;
    }
  }

  async assignStaffToDepartment(staffId, departmentId) {
    try {
      return await Staff.findByIdAndUpdate(
        staffId,
        { departmentId },
        { new: true },
      ).select("-password");
    } catch (error) {
      console.error("DAO Error - assignStaffToDepartment:", error);
      throw error;
    }
  }

  async getStaffNotInDepartment() {
    try {
      return await Staff.find({
        role: "staff",
        $or: [{ departmentId: { $exists: false } }, { departmentId: null }],
      }).select("personalInfo role _id");
    } catch (error) {
      console.error("DAO Error - getStaffNotInDepartment:", error);
      throw error;
    }
  }

  async removeStaffFromDepartment(staffId) {
    try {
      const staff = await Staff.findById(staffId);
      if (staff && staff.role === "manager" && staff.departmentId) {
        await Department.updateOne(
          { _id: staff.departmentId, managerId: staffId },
          { managerId: null },
        );
      }

      return await Staff.findByIdAndUpdate(
        staffId,
        { departmentId: null },
        { new: true, runValidators: true },
      ).select("-password");
    } catch (error) {
      console.error("DAO Error - removeStaffFromDepartment:", error);
      throw error;
    }
  }
}

module.exports = new StaffDAO();
