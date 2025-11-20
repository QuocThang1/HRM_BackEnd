const {
    createSalaryService,
    getAllSalariesService,
    getSalaryService,
    getSalaryByStaffService,
    updateSalaryService,
    deleteSalaryService,
    getMySalaryService,
} = require("../services/salaryService");

const createSalary = async (req, res) => {
    try {
        const { staffId, hourlyRate } = req.body;
        const data = await createSalaryService(staffId, hourlyRate);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - createSalary:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getAllSalaries = async (req, res) => {
    try {
        const data = await getAllSalariesService();
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getAllSalaries:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getSalary = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await getSalaryService(id);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getSalary:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getSalaryByStaff = async (req, res) => {
    try {
        const { staffId } = req.params;
        const data = await getSalaryByStaffService(staffId);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getSalaryByStaff:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const updateSalary = async (req, res) => {
    try {
        const { id } = req.params;
        const { hourlyRate } = req.body;
        const data = await updateSalaryService(id, hourlyRate);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - updateSalary:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const deleteSalary = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await deleteSalaryService(id);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - deleteSalary:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getMySalary = async (req, res) => {
    try {
        const staffId = req.staff._id; // Lấy từ token
        const data = await getMySalaryService(staffId);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getMySalary:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

module.exports = {
    createSalary,
    getAllSalaries,
    getSalary,
    getSalaryByStaff,
    updateSalary,
    deleteSalary,
    getMySalary,
};