const Staff = require("../models/staff");

class CandidateDAO {
    async submitCV(candidateId, cvUrl) {
        try {
            return await Staff.findByIdAndUpdate(
                candidateId,
                {
                    role: "candidate",
                    "candidateInfo.cvUrl": cvUrl,
                    "candidateInfo.status": "pending"
                },
                { new: true, runValidators: true }
            ).select("-password");
        } catch (error) {
            console.error("DAO Error - submitCV:", error);
            throw error;
        }
    }

    async getAllCandidates(status) {
        try {
            const filter = {
                role: "candidate",
                "candidateInfo.cvUrl": { $exists: true, $ne: null }
            };
            if (status) {
                filter["candidateInfo.status"] = status;
            }
            return await Staff.find(filter).select("-password");
        } catch (error) {
            console.error("DAO Error - getAllCandidates:", error);
            throw error;
        }
    }

    async updateCandidateStatus(candidateId, status) {
        try {
            const updateData = {
                "candidateInfo.status": status
            };

            // Nếu approved thì chuyển role thành staff
            if (status === "approved") {
                updateData.role = "staff";
            }

            return await Staff.findByIdAndUpdate(
                candidateId,
                updateData,
                { new: true, runValidators: true }
            ).select("-password");
        } catch (error) {
            console.error("DAO Error - updateCandidateStatus:", error);
            throw error;
        }
    }
}

module.exports = new CandidateDAO();