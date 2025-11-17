const express = require("express");
const {
    submitResignation,
    getMyResignations,
    getResignationsByApprover,
    getAllResignations,
    updateResignationStatus,
    deleteResignation,
} = require("../controllers/resignationController");

const checkRole = require("../middleware/checkRole");

const routerAPI = express.Router();

routerAPI.post("/", checkRole("staff"), submitResignation);
routerAPI.get("/my-resignations", checkRole("staff"), getMyResignations);
routerAPI.get("/approver", checkRole("admin"), getResignationsByApprover);
routerAPI.get("/", checkRole("admin"), getAllResignations);
routerAPI.put("/:id/status", checkRole("admin"), updateResignationStatus);
routerAPI.delete("/:id", checkRole("admin"), deleteResignation);

module.exports = routerAPI;