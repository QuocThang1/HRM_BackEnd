const monthlySalaryDAO = require("../DAO/monthlySalaryDAO");
const staffDAO = require("../DAO/staffDAO");
const salaryDAO = require("../DAO/salaryDAO");
const attendanceDAO = require("../DAO/attendanceDAO");

const calculateTotalHoursWorkedService = async (staffId, month, year) => {
    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        const attendances = await attendanceDAO.getAttendancesByStaffAndDateRange(
            staffId,
            startDate,
            endDate
        );

        const totalHours = attendances.reduce(
            (sum, attendance) => sum + (attendance.workingHours || 0),
            0
        );

        return totalHours;
    } catch (error) {
        console.error("Service Error - calculateTotalHoursWorkedService:", error);
        throw error;
    }
};

const createMonthlySalaryService = async (data, createdBy) => {
    try {
        const { staffId, month, year, bonus, deduction, note } = data;

        const staff = await staffDAO.getStaffByID(staffId);
        if (!staff) {
            return { EC: 1, EM: "Staff not found" };
        }

        const existingSalary = await monthlySalaryDAO.getMonthlySalaryByStaffAndMonth(
            staffId,
            month,
            year
        );
        if (existingSalary) {
            return { EC: 2, EM: "Monthly salary already exists for this period" };
        }

        const salary = await salaryDAO.getSalaryByStaff(staffId);
        if (!salary) {
            return { EC: 3, EM: "No hourly rate found for this staff" };
        }

        let totalHoursWorked;
        if (staff.role === "manager") {
            totalHoursWorked = 160;
        } else {
            totalHoursWorked = await calculateTotalHoursWorkedService(
                staffId,
                month,
                year
            );
        }
        const monthlySalary = await monthlySalaryDAO.createMonthlySalary({
            staffId,
            month,
            year,
            totalHoursWorked,
            hourlyRate: salary.hourlyRate,
            bonus: bonus || 0,
            deduction: deduction || 0,
            note,
            createdBy,
        });

        return {
            EC: 0,
            EM: "Monthly salary created successfully",
            data: monthlySalary,
        };
    } catch (error) {
        console.error("Service Error - createMonthlySalaryService:", error);
        return { EC: -1, EM: "Error creating monthly salary" };
    }
};

const getAllMonthlySalariesService = async () => {
    try {
        const monthlySalaries = await monthlySalaryDAO.getAllMonthlySalaries();
        return { EC: 0, EM: "Success", data: monthlySalaries };
    } catch (error) {
        console.error("Service Error - getAllMonthlySalariesService:", error);
        return { EC: -1, EM: "Error fetching monthly salaries" };
    }
};

const getMonthlySalaryService = async (id) => {
    try {
        const monthlySalary = await monthlySalaryDAO.getMonthlySalaryById(id);
        if (!monthlySalary) {
            return { EC: 1, EM: "Monthly salary not found" };
        }
        return { EC: 0, EM: "Success", data: monthlySalary };
    } catch (error) {
        console.error("Service Error - getMonthlySalaryService:", error);
        return { EC: -1, EM: "Error fetching monthly salary" };
    }
};

const getMonthlySalariesByStaffService = async (staffId) => {
    try {
        const staff = await staffDAO.getStaffByID(staffId);
        if (!staff) {
            return { EC: 1, EM: "Staff not found" };
        }

        const monthlySalaries = await monthlySalaryDAO.getMonthlySalariesByStaff(staffId);
        return { EC: 0, EM: "Success", data: monthlySalaries };
    } catch (error) {
        console.error("Service Error - getMonthlySalariesByStaffService:", error);
        return { EC: -1, EM: "Error fetching monthly salaries" };
    }
};

const getMyMonthlySalariesService = async (staffId) => {
    try {
        const monthlySalaries = await monthlySalaryDAO.getMonthlySalariesByStaff(staffId);
        return { EC: 0, EM: "Success", data: monthlySalaries };
    } catch (error) {
        console.error("Service Error - getMyMonthlySalariesService:", error);
        return { EC: -1, EM: "Error fetching your monthly salaries" };
    }
};

const getMonthlySalariesByMonthService = async (month, year) => {
    try {
        const monthlySalaries = await monthlySalaryDAO.getMonthlySalariesByMonth(
            month,
            year
        );
        return { EC: 0, EM: "Success", data: monthlySalaries };
    } catch (error) {
        console.error("Service Error - getMonthlySalariesByMonthService:", error);
        return { EC: -1, EM: "Error fetching monthly salaries" };
    }
};

const updateMonthlySalaryService = async (id, updateData) => {
    try {
        const { bonus, deduction, note } = updateData;

        const monthlySalary = await monthlySalaryDAO.getMonthlySalaryById(id);
        if (!monthlySalary) {
            return { EC: 1, EM: "Monthly salary not found" };
        }

        const updates = {};
        if (bonus !== undefined) updates.bonus = bonus;
        if (deduction !== undefined) updates.deduction = deduction;
        if (note !== undefined) updates.note = note;

        const updatedMonthlySalary = await monthlySalaryDAO.updateMonthlySalary(
            id,
            updates
        );

        return {
            EC: 0,
            EM: "Monthly salary updated successfully",
            data: updatedMonthlySalary,
        };
    } catch (error) {
        console.error("Service Error - updateMonthlySalaryService:", error);
        return { EC: -1, EM: "Error updating monthly salary" };
    }
};

const deleteMonthlySalaryService = async (id) => {
    try {
        const monthlySalary = await monthlySalaryDAO.getMonthlySalaryById(id);
        if (!monthlySalary) {
            return { EC: 1, EM: "Monthly salary not found" };
        }

        if (monthlySalary.status === "paid") {
            return { EC: 2, EM: "Cannot delete paid salary" };
        }

        await monthlySalaryDAO.deleteMonthlySalary(id);
        return { EC: 0, EM: "Monthly salary deleted successfully" };
    } catch (error) {
        console.error("Service Error - deleteMonthlySalaryService:", error);
        return { EC: -1, EM: "Error deleting monthly salary" };
    }
};

const checkMonthlySalaryExistsService = async (staffId, month, year) => {
    try {
        const staff = await staffDAO.getStaffByID(staffId);
        if (!staff) {
            return { EC: 1, EM: "Staff not found" };
        }

        const exists = await monthlySalaryDAO.checkMonthlySalaryExists(
            staffId,
            month,
            year
        );

        return {
            EC: 0,
            EM: "Success",
            data: { exists },
        };
    } catch (error) {
        console.error("Service Error - checkMonthlySalaryExistsService:", error);
        return { EC: -1, EM: "Error checking monthly salary" };
    }
};

module.exports = {
    createMonthlySalaryService,
    getAllMonthlySalariesService,
    getMonthlySalaryService,
    getMonthlySalariesByStaffService,
    getMyMonthlySalariesService,
    getMonthlySalariesByMonthService,
    updateMonthlySalaryService,
    deleteMonthlySalaryService,
    checkMonthlySalaryExistsService,
};