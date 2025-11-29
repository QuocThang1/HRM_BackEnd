const CandidateDAO = require("../DAO/candidateDAO");
const cvScreeningService = require("./cvScreeningService");
const cvEmailService = require("./cvEmailService");

const submitCVService = async (candidateId, cvUrl) => {
  try {
    if (!cvUrl) {
      return { EC: 1, EM: "CV URL is required" };
    }

    const existingCV = await CandidateDAO.checkExistingCV(candidateId);
    if (existingCV) {
      return { EC: 1, EM: "A pending CV already exists for this candidate" };
    }

    const updatedCandidate = await CandidateDAO.submitCV(candidateId, cvUrl);
    if (!updatedCandidate) {
      return { EC: 1, EM: "Candidate not found" };
    }

    try {
      await cvEmailService.sendCVPendingEmail({
        email: updatedCandidate.personalInfo.email,
        fullName: updatedCandidate.personalInfo.fullName,
      });

    } catch (emailError) {
      console.error("Failed to send pending email:", emailError.message);
    }

    return {
      EC: 0,
      EM: "CV submitted successfully",
      data: updatedCandidate,
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
      data: candidates,
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

    const updatedCandidate = await CandidateDAO.updateCandidateStatus(
      candidateId,
      status
    );
    if (!updatedCandidate) {
      return { EC: 1, EM: "Candidate not found" };
    }

    try {
      if (status === "approved") {
        await cvEmailService.sendCVApprovedEmail({
          email: updatedCandidate.personalInfo.email,
          fullName: updatedCandidate.personalInfo.fullName,
        });
      } else if (status === "rejected") {
        await cvEmailService.sendCVRejectedEmail(
          {
            email: updatedCandidate.personalInfo.email,
            fullName: updatedCandidate.personalInfo.fullName,
          },
        );
      }
    } catch (emailError) {
      console.error("Failed to send status email:", emailError.message);
    }

    return {
      EC: 0,
      EM: "Candidate status updated successfully",
      data: updatedCandidate,
    };
  } catch (error) {
    console.error("Service Error - updateCandidateStatusService:", error);
    return { EC: -1, EM: "Error updating candidate status" };
  }
};

const autoScreenCVService = async (candidateId, requiredFields) => {
  try {

    const candidate = await CandidateDAO.getCandidateById(candidateId);
    if (!candidate) {
      return { EC: 1, EM: "Candidate not found" };
    }

    if (!candidate.candidateInfo?.cvUrl) {
      return { EC: 1, EM: "CV URL not found" };
    }

    const aiResult = await cvScreeningService.analyzeCVWithGemini(
      candidate.candidateInfo.cvUrl,
      requiredFields
    );

    if (aiResult.EC && aiResult.EC !== 0) {
      return {
        EC: aiResult.EC,
        EM: "AI analysis failed: " + aiResult.EM,
        data: null,
      };
    }

    let shouldReject = false;
    let rejectionReason = null;

    if (!aiResult.validation.isValid) {
      shouldReject = true;
      rejectionReason = `CV is missing required fields: ${aiResult.validation.missingFields.join(", ")}. Please update CV with complete information.`;

      await CandidateDAO.updateCandidateStatus(candidateId, "rejected");

      try {
        await cvEmailService.sendCVRejectedEmail(
          {
            email: candidate.personalInfo.email,
            fullName: candidate.personalInfo.fullName,
          },
          rejectionReason
        );
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError.message);
      }
    } else {
      console.log("All required fields found - Admin can manually approve");
    }

    const updatedCandidate = await CandidateDAO.getCandidateById(candidateId);

    return {
      EC: 0,
      EM: shouldReject
        ? "CV auto-rejected due to missing fields"
        : "CV screening complete - All fields found",
      data: {
        candidate: updatedCandidate,
        aiAnalysis: {
          extractedData: aiResult.extractedData,
          validation: aiResult.validation,
          shouldReject,
          rejectionReason,
          message: shouldReject
            ? " Auto rejected by AI"
            : " Passed AI screening - Waiting for admin approval",
        },
      },
    };
  } catch (error) {
    console.error("Service Error - autoScreenCVService:", error);
    return {
      EC: -1,
      EM: "Error auto-screening CV: " + error.message,
    };
  }
};

const deleteCVService = async (candidateId) => {
  try {
    const existingCandidate = await CandidateDAO.getCandidateById(candidateId);
    if (existingCandidate.candidateInfo?.status === "pending") {
      return { EC: 1, EM: "CV can only be deleted if it is not in pending status" };
    }

    const deletedCandidate = await CandidateDAO.deleteCV(candidateId);
    return {
      EC: 0,
      EM: "CV deleted successfully",
      data: deletedCandidate,
    };
  } catch (error) {
    console.error("Service Error - deleteCVService:", error);
    return { EC: -1, EM: "Error deleting CV" };
  }
};

module.exports = {
  submitCVService,
  getAllCandidatesService,
  updateCandidateStatusService,
  autoScreenCVService,
  deleteCVService,
};