const salaryDAO = require("../DAO/salaryDAO");
const staffDAO = require("../DAO/staffDAO");

const createSalaryService = async (staffId, hourlyRate) => {
  try {
    const staff = await staffDAO.getStaffByID(staffId);
    if (!staff) {
      return { EC: 1, EM: "Staff not found" };
    }

    if (hourlyRate <= 0) {
      return { EC: 2, EM: "Hourly rate must be greater than 0" };
    }

    const existingSalary = await salaryDAO.getSalaryByStaff(staffId);
    if (existingSalary) {
      return { EC: 3, EM: "Salary already exists for this staff" };
    }

    const salary = await salaryDAO.createSalary({ staffId, hourlyRate });

    return {
      EC: 0,
      EM: "Salary created successfully",
      data: salary,
    };
  } catch (error) {
    console.error("Service Error - createSalaryService:", error);
    return { EC: -1, EM: "Error creating salary" };
  }
};

const getAllSalariesService = async () => {
  try {
    const salaries = await salaryDAO.getAllSalaries();
    return { EC: 0, EM: "Success", data: salaries };
  } catch (error) {
    console.error("Service Error - getAllSalariesService:", error);
    return { EC: -1, EM: "Error fetching salaries" };
  }
};

const getSalaryService = async (id) => {
  try {
    const salary = await salaryDAO.getSalaryById(id);
    if (!salary) {
      return { EC: 1, EM: "Salary not found" };
    }
    return { EC: 0, EM: "Success", data: salary };
  } catch (error) {
    console.error("Service Error - getSalaryService:", error);
    return { EC: -1, EM: "Error fetching salary" };
  }
};

const getSalaryByStaffService = async (staffId) => {
  try {
    const staff = await staffDAO.getStaffByID(staffId);
    if (!staff) {
      return { EC: 1, EM: "Staff not found" };
    }

    const salary = await salaryDAO.getSalaryByStaff(staffId);
    if (!salary) {
      return { EC: 2, EM: "No salary found for this staff" };
    }

    return { EC: 0, EM: "Success", data: salary };
  } catch (error) {
    console.error("Service Error - getSalaryByStaffService:", error);
    return { EC: -1, EM: "Error fetching salary" };
  }
};

const updateSalaryService = async (id, hourlyRate) => {
  try {
    const salary = await salaryDAO.getSalaryById(id);
    if (!salary) {
      return { EC: 1, EM: "Salary not found" };
    }

    if (hourlyRate <= 0) {
      return { EC: 2, EM: "Hourly rate must be greater than 0" };
    }

    const updatedSalary = await salaryDAO.updateSalary(id, { hourlyRate });

    return {
      EC: 0,
      EM: "Salary updated successfully",
      data: updatedSalary,
    };
  } catch (error) {
    console.error("Service Error - updateSalaryService:", error);
    return { EC: -1, EM: "Error updating salary" };
  }
};

const deleteSalaryService = async (id) => {
  try {
    const salary = await salaryDAO.getSalaryById(id);
    if (!salary) {
      return { EC: 1, EM: "Salary not found" };
    }

    await salaryDAO.deleteSalary(id);
    return { EC: 0, EM: "Salary deleted successfully" };
  } catch (error) {
    console.error("Service Error - deleteSalaryService:", error);
    return { EC: -1, EM: "Error deleting salary" };
  }
};

const getMySalaryService = async (staffId) => {
  try {
    const salary = await salaryDAO.getSalaryByStaff(staffId);
    if (!salary) {
      return { EC: 1, EM: "No salary found for your account" };
    }

    return { EC: 0, EM: "Success", data: salary };
  } catch (error) {
    console.error("Service Error - getMySalaryService:", error);
    return { EC: -1, EM: "Error fetching your salary" };
  }
};

module.exports = {
  createSalaryService,
  getAllSalariesService,
  getSalaryService,
  getSalaryByStaffService,
  updateSalaryService,
  deleteSalaryService,
  getMySalaryService,
};
