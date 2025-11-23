const express = require("express");
const {
    createPolicy,
    getAllPolicies,
    getPolicy,
    updatePolicy,
    deletePolicy,
    getPoliciesByCategory,
} = require("../controllers/policyController");

const checkRole = require("../middleware/checkRole");

const routerAPI = express.Router();

routerAPI.post("/", checkRole("admin"), createPolicy);
routerAPI.get("/", checkRole("admin"), getAllPolicies);
routerAPI.get("/category/:category", checkRole("admin"), getPoliciesByCategory);
routerAPI.get("/:id", checkRole("admin"), getPolicy);
routerAPI.put("/:id", checkRole("admin"), updatePolicy);
routerAPI.delete("/:id", checkRole("admin"), deletePolicy);

module.exports = routerAPI;