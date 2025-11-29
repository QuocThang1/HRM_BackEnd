const express = require("express");
const {
  submitCV,
  getAllCandidates,
  updateCandidateStatus,
  autoScreenCV,
  deleteCV,
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
routerAPI.post("/:candidateId/auto-screen", checkRole("admin"), autoScreenCV);
routerAPI.delete("/:candidateId/delete-cv", checkRole("admin"), deleteCV);

module.exports = routerAPI;
