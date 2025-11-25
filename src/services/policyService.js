const policyDAO = require("../DAO/policyDAO");

const createPolicyService = async (data, createdBy) => {
  try {
    const { title, category, content } = data;

    if (!title || !category || !content) {
      return { EC: 1, EM: "Title, category, and content are required" };
    }

    const policy = await policyDAO.createPolicy({
      title,
      category,
      content,
      createdBy,
    });

    return {
      EC: 0,
      EM: "Policy created successfully",
      data: policy,
    };
  } catch (error) {
    console.error("Service Error - createPolicyService:", error);
    return { EC: -1, EM: "Error creating policy" };
  }
};

const getAllPoliciesService = async () => {
  try {
    const policies = await policyDAO.getAllPoliciesForAdmin();
    return { EC: 0, EM: "Success", data: policies };
  } catch (error) {
    console.error("Service Error - getAllPoliciesService:", error);
    return { EC: -1, EM: "Error fetching policies" };
  }
};

const getPolicyService = async (id) => {
  try {
    const policy = await policyDAO.getPolicyById(id);
    if (!policy) {
      return { EC: 1, EM: "Policy not found" };
    }
    return { EC: 0, EM: "Success", data: policy };
  } catch (error) {
    console.error("Service Error - getPolicyService:", error);
    return { EC: -1, EM: "Error fetching policy" };
  }
};

const getPoliciesByCategoryService = async (category) => {
  try {
    const policies = await policyDAO.getPoliciesByCategoryForAdmin(category);
    return { EC: 0, EM: "Success", data: policies };
  } catch (error) {
    console.error("Service Error - getPoliciesByCategoryService:", error);
    return { EC: -1, EM: "Error fetching policies by category" };
  }
};

const updatePolicyService = async (id, updateData) => {
  try {
    const { title, category, content, isActive } = updateData;

    const policy = await policyDAO.getPolicyById(id);
    if (!policy) {
      return { EC: 1, EM: "Policy not found" };
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (category !== undefined) updates.category = category;
    if (content !== undefined) updates.content = content;
    if (isActive !== undefined) updates.isActive = isActive;

    const updatedPolicy = await policyDAO.updatePolicy(id, updates);

    return {
      EC: 0,
      EM: "Policy updated successfully",
      data: updatedPolicy,
    };
  } catch (error) {
    console.error("Service Error - updatePolicyService:", error);
    return { EC: -1, EM: "Error updating policy" };
  }
};

const deletePolicyService = async (id) => {
  try {
    const policy = await policyDAO.getPolicyById(id);
    if (!policy) {
      return { EC: 1, EM: "Policy not found" };
    }

    await policyDAO.deletePolicy(id);
    return { EC: 0, EM: "Policy deleted successfully" };
  } catch (error) {
    console.error("Service Error - deletePolicyService:", error);
    return { EC: -1, EM: "Error deleting policy" };
  }
};

module.exports = {
  createPolicyService,
  getAllPoliciesService,
  getPolicyService,
  updatePolicyService,
  deletePolicyService,
  getPoliciesByCategoryService,
};
