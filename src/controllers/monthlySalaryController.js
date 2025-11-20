const {
    createMonthlySalaryService,
    getAllMonthlySalariesService,
    getMonthlySalaryService,
    getMonthlySalariesByStaffService,
    getMyMonthlySalariesService,
    getMonthlySalariesByMonthService,
    updateMonthlySalaryService,
    deleteMonthlySalaryService,
    checkMonthlySalaryExistsService,
} = require("../services/monthlySalaryService");

const createMonthlySalary = async (req, res) => {
    try {
        const createdBy = req.staff._id;
        const data = req.body;

        const result = await createMonthlySalaryService(data, createdBy);
        res.json(result);
    } catch (error) {
        console.error("Controller Error - createMonthlySalary:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getAllMonthlySalaries = async (req, res) => {
    try {
        const data = await getAllMonthlySalariesService();
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getAllMonthlySalaries:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getMonthlySalary = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await getMonthlySalaryService(id);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getMonthlySalary:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getMonthlySalariesByStaff = async (req, res) => {
    try {
        const { staffId } = req.params;
        const data = await getMonthlySalariesByStaffService(staffId);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getMonthlySalariesByStaff:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getMyMonthlySalaries = async (req, res) => {
    try {
        const staffId = req.staff._id;
        const data = await getMyMonthlySalariesService(staffId);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getMyMonthlySalaries:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getMonthlySalariesByMonth = async (req, res) => {
    try {
        const { month, year } = req.params;
        const data = await getMonthlySalariesByMonthService(
            parseInt(month),
            parseInt(year)
        );
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getMonthlySalariesByMonth:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const updateMonthlySalary = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const data = await updateMonthlySalaryService(id, updateData);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - updateMonthlySalary:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const deleteMonthlySalary = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await deleteMonthlySalaryService(id);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - deleteMonthlySalary:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const checkMonthlySalaryExists = async (req, res) => {
    try {
        const { staffId, month, year } = req.params;
        const data = await checkMonthlySalaryExistsService(
            staffId,
            parseInt(month),
            parseInt(year)
        );
        res.json(data);
    } catch (error) {
        console.error("Controller Error - checkMonthlySalaryExists:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

module.exports = {
    createMonthlySalary,
    getAllMonthlySalaries,
    getMonthlySalary,
    getMonthlySalariesByStaff,
    getMyMonthlySalaries,
    getMonthlySalariesByMonth,
    updateMonthlySalary,
    deleteMonthlySalary,
    checkMonthlySalaryExists,
};