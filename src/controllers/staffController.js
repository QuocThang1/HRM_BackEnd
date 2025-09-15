const {
  createStaffService,
  updateProfileService,
} = require("../services/staffService");
const { handleLoginService } = require("../services/staffService");
const { getStaffService } = require("../services/staffService");
const { getAccountService } = require("../services/staffService");

const createStaff = async (req, res) => {
  const { name, email, password, address, phone, gender } = req.body;
  const data = await createStaffService(
    name,
    email,
    password,
    address,
    phone,
    gender,
  );
  return res.status(200).json(data);
};

const updateProfile = async (req, res) => {
  const { name, email, address, phone } = req.body;
  const staffId = req.staff.id; // Assuming staff ID is stored in req.staff
  const data = await updateProfileService(staffId, name, email, address, phone);
  return res.status(200).json(data);
};
const handleLogin = async (req, res) => {
  const { email, password } = req.body; // Assuming email and password are sent as query parameters
  const data = await handleLoginService(email, password);
  return res.status(200).json(data);
};

const getStaff = async (req, res) => {
  const data = await getStaffService();
  return res.status(200).json(data);
};

const getAccount = async (req, res) => {
  const staffId = req.staff._id;
  const data = await getAccountService(staffId);
  return res.status(200).json(data);
};

module.exports = {
  createStaff,
  handleLogin,
  getStaff,
  getAccount,
  updateProfile,
};
