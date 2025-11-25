const Policy = require("../models/policy");

class PolicyDAO {
  async createPolicy(data) {
    try {
      const policy = new Policy(data);
      return await policy.save();
    } catch (error) {
      console.error("DAO Error - createPolicy:", error);
      throw error;
    }
  }

  async getAllPolicies() {
    try {
      return await Policy.find({ isActive: true })
        .populate("createdBy", "personalInfo.fullName")
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error("DAO Error - getAllPolicies:", error);
      throw error;
    }
  }

  async getAllPoliciesForAdmin() {
    try {
      return await Policy.find()
        .populate("createdBy", "personalInfo.fullName")
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error("DAO Error - getAllPoliciesForAdmin:", error);
      throw error;
    }
  }

  async getPolicyById(id) {
    try {
      return await Policy.findById(id).populate(
        "createdBy",
        "personalInfo.fullName",
      );
    } catch (error) {
      console.error("DAO Error - getPolicyById:", error);
      throw error;
    }
  }

  async getPoliciesByCategory(category) {
    try {
      return await Policy.find({ category, isActive: true });
    } catch (error) {
      console.error("DAO Error - getPoliciesByCategory:", error);
      throw error;
    }
  }

  async updatePolicy(id, data) {
    try {
      return await Policy.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      console.error("DAO Error - updatePolicy:", error);
      throw error;
    }
  }

  async deletePolicy(id) {
    try {
      return await Policy.findByIdAndDelete(id);
    } catch (error) {
      console.error("DAO Error - deletePolicy:", error);
      throw error;
    }
  }
}

module.exports = new PolicyDAO();
