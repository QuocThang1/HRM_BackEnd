const CandidateDAO = require("../DAO/candidateDAO");

const submitCVService = async (candidateId, cvUrl) => {
    try {
        if (!cvUrl) {
            return { EC: 1, EM: "CV URL is required" };
        }

        const updatedCandidate = await CandidateDAO.submitCV(candidateId, cvUrl);
        if (!updatedCandidate) {
            return { EC: 1, EM: "Candidate not found" };
        }

        return {
            EC: 0,
            EM: "CV submitted successfully",
            data: updatedCandidate
        };
    } catch (error) {
        console.error("Service Error - submitCVService:", error);
        return { EC: -1, EM: "Error submitting CV" };
    }
};

const getAllCandidatesService = async (status) => {
    try {
        const candidates = await CandidateDAO.getAllCandidates(status);
        return {
            EC: 0,
            EM: "Get candidates successfully",
            data: candidates
        };
    } catch (error) {
        console.error("Service Error - getAllCandidatesService:", error);
        return { EC: -1, EM: "Error getting candidates" };
    }
};

const updateCandidateStatusService = async (candidateId, status) => {
    try {
        if (!["pending", "approved", "rejected"].includes(status)) {
            return { EC: 1, EM: "Invalid status" };
        }

        const updatedCandidate = await CandidateDAO.updateCandidateStatus(candidateId, status);
        if (!updatedCandidate) {
            return { EC: 1, EM: "Candidate not found" };
        }

        return {
            EC: 0,
            EM: "Candidate status updated successfully",
            data: updatedCandidate
        };
    } catch (error) {
        console.error("Service Error - updateCandidateStatusService:", error);
        return { EC: -1, EM: "Error updating candidate status" };
    }
};

module.exports = {
    submitCVService,
    getAllCandidatesService,
    updateCandidateStatusService
};

