const express = require("express");
const {
    createContract,
    getAllContracts,
    getContract,
    getContractByStaffId,
    getContractsByStatus,
    updateContract,
    updateContractStatus,
    deleteContract,
    getExpiringContracts,
    getMyContract,
} = require("../controllers/contractController");

const checkRole = require("../middleware/checkRole");

const routerAPI = express.Router();

routerAPI.post("/", checkRole("admin"), createContract);
routerAPI.get("/", checkRole("admin"), getAllContracts);

routerAPI.get("/my-contract", checkRole("staff", "manager"), getMyContract);
routerAPI.get("/expiring", checkRole("admin"), getExpiringContracts);
routerAPI.get("/status/:status", checkRole("admin"), getContractsByStatus);
routerAPI.get("/staff/:staffId", checkRole("admin"), getContractByStaffId);

routerAPI.get("/:id", checkRole("admin", "staff", "manager"), getContract);
routerAPI.put("/:id", checkRole("admin"), updateContract);
routerAPI.patch("/:id/status", checkRole("admin"), updateContractStatus);
routerAPI.delete("/:id", checkRole("admin"), deleteContract);

module.exports = routerAPI;