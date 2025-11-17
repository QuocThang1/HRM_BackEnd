const express = require("express");
const {
    createShiftType,
    getAllShiftTypes,
    getShiftType,
    updateShiftType,
    deleteShiftType,
} = require("../controllers/shiftTypeController");

const checkRole = require("../middleware/checkRole");

const routerAPI = express.Router();

routerAPI.post("/", checkRole("admin"), createShiftType);
routerAPI.get("/", checkRole("admin"), getAllShiftTypes);
routerAPI.get("/:id", checkRole("admin"), getShiftType);
routerAPI.put("/:id", checkRole("admin"), updateShiftType);
routerAPI.delete("/:id", checkRole("admin"), deleteShiftType);

module.exports = routerAPI;