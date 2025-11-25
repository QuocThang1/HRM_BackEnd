const contractDAO = require("../DAO/contractDAO");
const staffDAO = require("../DAO/staffDAO");

const createContractService = async (staffId, content, fromDate, toDate, createdBy) => {
    try {
        const staff = await staffDAO.getStaffByID(staffId);
        if (!staff) {
            return { EC: 1, EM: "Staff not found" };
        }

        if (!["staff", "manager"].includes(staff.role)) {
            return { EC: 1, EM: "Can only create contract for staff and manager" };
        }

        const from = new Date(fromDate);
        const to = new Date(toDate);
        if (to <= from) {
            return { EC: 1, EM: "ToDate must be after FromDate" };
        }

        const contractData = {
            staffId,
            content,
            fromDate: from,
            toDate: to,
            createdBy,
        };

        const contract = await contractDAO.createContract(contractData);
        return { EC: 0, EM: "Contract created successfully", data: contract };
    } catch (error) {
        console.error("Service Error - createContractService:", error);
        if (error.message.includes("already has an active contract")) {
            return { EC: 1, EM: "Staff already has an active contract" };
        }
        return { EC: -1, EM: "Error creating contract" };
    }
};

const getAllContractsService = async () => {
    try {
        const contracts = await contractDAO.getAllContracts();
        return { EC: 0, EM: "Success", data: contracts };
    } catch (error) {
        console.error("Service Error - getAllContractsService:", error);
        return { EC: -1, EM: "Error fetching contracts" };
    }
};

const getContractService = async (id) => {
    try {
        const contract = await contractDAO.getContractById(id);
        if (!contract) {
            return { EC: 1, EM: "Contract not found" };
        }
        return { EC: 0, EM: "Success", data: contract };
    } catch (error) {
        console.error("Service Error - getContractService:", error);
        return { EC: -1, EM: "Error fetching contract" };
    }
};

const getContractByStaffIdService = async (staffId) => {
    try {
        const contract = await contractDAO.getContractByStaffId(staffId);
        if (!contract) {
            return { EC: 1, EM: "Contract not found for this staff" };
        }
        return { EC: 0, EM: "Success", data: contract };
    } catch (error) {
        console.error("Service Error - getContractByStaffIdService:", error);
        return { EC: -1, EM: "Error fetching contract" };
    }
};

const getContractsByStatusService = async (status) => {
    try {
        if (!["active", "expired"].includes(status)) {
            return { EC: 1, EM: "Invalid status" };
        }

        const contracts = await contractDAO.getContractsByStatus(status);
        return { EC: 0, EM: "Success", data: contracts };
    } catch (error) {
        console.error("Service Error - getContractsByStatusService:", error);
        return { EC: -1, EM: "Error fetching contracts" };
    }
};

const updateContractService = async (id, content, status, fromDate, toDate) => {
    try {
        const existingContract = await contractDAO.getContractById(id);
        if (!existingContract) {
            return { EC: 1, EM: "Contract not found" };
        }

        if (existingContract.status === "expired") {
            return { EC: 1, EM: "Cannot update expired contract" };
        }

        if (fromDate && toDate) {
            const from = new Date(fromDate);
            const to = new Date(toDate);
            if (to <= from) {
                return { EC: 1, EM: "ToDate must be after FromDate" };
            }
        }

        const updateData = {};
        if (content) updateData.content = content;
        if (status) updateData.status = status;
        if (fromDate) updateData.fromDate = new Date(fromDate);
        if (toDate) updateData.toDate = new Date(toDate);

        const contract = await contractDAO.updateContract(id, updateData);
        if (!contract) {
            return { EC: 1, EM: "Contract not found" };
        }

        return { EC: 0, EM: "Contract updated successfully", data: contract };
    } catch (error) {
        console.error("Service Error - updateContractService:", error);
        return { EC: -1, EM: "Error updating contract" };
    }
};

const updateContractStatusService = async (id, status) => {
    try {
        if (!["active", "expired"].includes(status)) {
            return { EC: 1, EM: "Invalid status" };
        }

        const contract = await contractDAO.updateContractStatus(id, status);
        if (!contract) {
            return { EC: 1, EM: "Contract not found" };
        }

        return { EC: 0, EM: "Contract status updated successfully", data: contract };
    } catch (error) {
        console.error("Service Error - updateContractStatusService:", error);
        return { EC: -1, EM: "Error updating contract status" };
    }
};

const deleteContractService = async (id) => {
    try {
        const contract = await contractDAO.deleteContract(id);
        if (!contract) {
            return { EC: 1, EM: "Contract not found" };
        }

        return { EC: 0, EM: "Contract deleted successfully" };
    } catch (error) {
        console.error("Service Error - deleteContractService:", error);
        return { EC: -1, EM: "Error deleting contract" };
    }
};

const getExpiringContractsService = async (days = 30) => {
    try {
        const contracts = await contractDAO.getExpiringContracts(days);
        return { EC: 0, EM: "Success", data: contracts };
    } catch (error) {
        console.error("Service Error - getExpiringContractsService:", error);
        return { EC: -1, EM: "Error fetching expiring contracts" };
    }
};

module.exports = {
    createContractService,
    getAllContractsService,
    getContractService,
    getContractByStaffIdService,
    getContractsByStatusService,
    updateContractService,
    updateContractStatusService,
    deleteContractService,
    getExpiringContractsService,
};