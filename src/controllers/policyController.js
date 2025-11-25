const {
  createPolicyService,
  getAllPoliciesService,
  getPolicyService,
  updatePolicyService,
  deletePolicyService,
  getPoliciesByCategoryService,
} = require("../services/policyService");

const createPolicy = async (req, res) => {
  try {
    const createdBy = req.staff._id;
    const data = req.body;

    const result = await createPolicyService(data, createdBy);
    res.json(result);
  } catch (error) {
    console.error("Controller Error - createPolicy:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const getAllPolicies = async (req, res) => {
  try {
    const data = await getAllPoliciesService();
    res.json(data);
  } catch (error) {
    console.error("Controller Error - getAllPolicies:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const getPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getPolicyService(id);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - getPolicy:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const getPoliciesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const data = await getPoliciesByCategoryService(category);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - getPoliciesByCategory:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const data = await updatePolicyService(id, updateData);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - updatePolicy:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await deletePolicyService(id);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - deletePolicy:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

module.exports = {
  createPolicy,
  getAllPolicies,
  getPolicy,
  updatePolicy,
  deletePolicy,
  getPoliciesByCategory,
};
