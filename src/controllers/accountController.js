const {
  handleSignUpService,
  handleLoginService,
  getAccountService,
  updateProfileService,
  requestPasswordResetService,
  resetPasswordService,
} = require("../services/accountService");

const handleSignUp = async (req, res) => {
  try {
    const { name, email, password, address, phone, gender, citizenId, dob } =
      req.body;
    console.log(req.body);
    const data = await handleSignUpService(
      name,
      email,
      password,
      address,
      phone,
      gender,
      citizenId,
      dob,
    );
    return res.status(200).json(data);
  } catch (error) {
    console.error("Controller Error - handleSignUp:", error);
    return res.status(500).json({ EC: -1, EM: "Internal Server Error" });
  }
};

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await handleLoginService(email, password);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Controller Error - handleLogin:", error);
    return res.status(500).json({ EC: -1, EM: "Internal Server Error" });
  }
};

const getAccount = async (req, res) => {
  try {
    const staffId = req.staff._id;
    const data = await getAccountService(staffId);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Controller Error - getAccount:", error);
    return res.status(500).json({ EC: -1, EM: "Internal Server Error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, address, phone, citizenId, dob, gender } = req.body;
    const staffId = req.staff._id;
    const data = await updateProfileService(
      staffId,
      name,
      email,
      address,
      phone,
      citizenId,
      dob,
      gender,
    );
    return res.status(200).json(data);
  } catch (error) {
    console.error("Controller Error - updateProfile:", error);
    return res.status(500).json({ EC: -1, EM: "Internal Server Error" });
  }
};

const handleForgotPassword = async (req, res) => {
  try {
    const { email, frontendUrl } = req.body;
    const data = await requestPasswordResetService(
      email,
      frontendUrl || process.env.FRONTEND_URL || "http://localhost:5173",
    );
    return res.status(200).json(data);
  } catch (error) {
    console.error("Controller Error - handleForgotPassword:", error);
    return res.status(500).json({ EC: -1, EM: "Internal Server Error" });
  }
};

const handleResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const data = await resetPasswordService(email, otp, newPassword);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Controller Error - handleResetPassword:", error);
    return res.status(500).json({ EC: -1, EM: "Internal Server Error" });
  }
};

const handleVerifyOtp = async (req, res) => {
  try {
    // accept either 'code' or 'otp' from client
    const { email, code, otp } = req.body;
    const codeToUse = otp || code;
    const data = await require("../services/accountService").verifyOtpService(
      email,
      codeToUse,
    );
    return res.status(200).json(data);
  } catch (error) {
    console.error("Controller Error - handleVerifyOtp:", error);
    return res.status(500).json({ EC: -1, EM: "Internal Server Error" });
  }
};

module.exports = {
  handleSignUp,
  handleLogin,
  getAccount,
  updateProfile,
  handleForgotPassword,
  handleResetPassword,
  handleVerifyOtp,
};
