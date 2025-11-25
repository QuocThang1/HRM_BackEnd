const {
  createContractService,
  getAllContractsService,
  getContractService,
  getContractByStaffIdService,
  getContractsByStatusService,
  updateContractService,
  updateContractStatusService,
  deleteContractService,
  getExpiringContractsService,
} = require("../services/contractService");

const createContract = async (req, res) => {
  try {
    const { staffId, content, fromDate, toDate } = req.body;
    const createdBy = req.staff._id;

    const data = await createContractService(
      staffId,
      content,
      fromDate,
      toDate,
      createdBy,
    );
    res.json(data);
  } catch (error) {
    console.error("Controller Error - createContract:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const getAllContracts = async (req, res) => {
  try {
    const data = await getAllContractsService();
    res.json(data);
  } catch (error) {
    console.error("Controller Error - getAllContracts:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const getMyContract = async (req, res) => {
  try {
    const staffId = req.staff._id;
    const data = await getContractByStaffIdService(staffId);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - getMyContract:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const getContract = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getContractService(id);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - getContract:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const getContractByStaffId = async (req, res) => {
  try {
    const { staffId } = req.params;
    const data = await getContractByStaffIdService(staffId);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - getContractByStaffId:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const getContractsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const data = await getContractsByStatusService(status);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - getContractsByStatus:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, status, fromDate, toDate } = req.body;

    const data = await updateContractService(
      id,
      content,
      status,
      fromDate,
      toDate,
    );
    res.json(data);
  } catch (error) {
    console.error("Controller Error - updateContract:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const updateContractStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.json({ EC: 1, EM: "Status is required" });
    }

    const data = await updateContractStatusService(id, status);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - updateContractStatus:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const deleteContract = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await deleteContractService(id);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - deleteContract:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

const getExpiringContracts = async (req, res) => {
  try {
    const { days } = req.query; // ?days=30
    const data = await getExpiringContractsService(days ? parseInt(days) : 30);
    res.json(data);
  } catch (error) {
    console.error("Controller Error - getExpiringContracts:", error);
    res.json({ EC: -1, EM: "Internal Server Error" });
  }
};

module.exports = {
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
};
