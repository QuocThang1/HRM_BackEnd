const express = require("express");
const {
  submitCV,
  getAllCandidates,
  updateCandidateStatus,
} = require("../controllers/candidateController");

const checkRole = require("../middleware/checkRole");

const routerAPI = express.Router();

routerAPI.post("/submit-cv", checkRole("candidate"), submitCV);
routerAPI.get("/", checkRole("admin"), getAllCandidates);
routerAPI.put(
  "/:candidateId/status",
  checkRole("admin"),
  updateCandidateStatus,
);

module.exports = routerAPI;
