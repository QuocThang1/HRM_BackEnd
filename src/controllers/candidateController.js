const {
  submitCVService,
  getAllCandidatesService,
  updateCandidateStatusService,
  autoScreenCVService,
  deleteCVService,
} = require("../services/candidateService");

const submitCV = async (req, res) => {
  try {
    const candidateId = req.staff._id; // Lấy từ token
    const { cvUrl } = req.body;
    const data = await submitCVService(candidateId, cvUrl);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - submitCV:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const getAllCandidates = async (req, res) => {
  try {
    const { status } = req.query; // pending, approved, rejected
    const data = await getAllCandidatesService(status);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - getAllCandidates:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const updateCandidateStatus = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { status } = req.body;
    const data = await updateCandidateStatusService(candidateId, status);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - updateCandidateStatus:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const autoScreenCV = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { requiredFields } = req.body;

    if (!requiredFields || Object.keys(requiredFields).length === 0) {
      return res.json({ EC: 1, EM: "Required fields are missing" });
    }

    const data = await autoScreenCVService(candidateId, requiredFields);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - autoScreenCV:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const deleteCV = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const data = await deleteCVService(candidateId);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - deleteCV:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};


module.exports = {
  submitCV,
  getAllCandidates,
  updateCandidateStatus,
  autoScreenCV,
  deleteCV,
};
