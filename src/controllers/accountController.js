const { Buffer } = require("buffer");
const {
  handleSignUpService,
  handleLoginService,
  getAccountService,
  updateProfileService,
  requestPasswordResetService,
  resetPasswordService,
  verifyOtpService,
} = require("../services/accountService");
const { notifyUserLogin } = require("../services/notificationService");

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

    // Create notification for login (admin sees who logged in)
    if (data && data.EC === 0 && data.staff) {
      await notifyUserLogin(
        data.staff._id,
        data.staff.name || data.staff.personalInfo?.fullName || email,
        email,
        data.staff.role,
      );
    }
    return res.status(200).json(data);
  } catch (error) {
    console.error("Controller Error - handleLogin:", error);
    return res.status(500).json({ EC: -1, EM: "Internal Server Error" });
  }
};

const getAccount = async (req, res) => {
  try {
    if (!req.staff || !req.staff._id) {
      return res
        .status(401)
        .json({ EC: -1, EM: "Unauthorized: staff not found" });
    }
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
    // Debug: log full body to ensure frontend payload is received
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

const handleRefreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ EC: 1, EM: "Refresh token is required" });
    }

    const jwt = require("jsonwebtoken");
    const staffDAO = require("../DAO/staffDAO");

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN_SECRET ||
          process.env.JWT_SECRET ||
          "default-refresh-secret",
      );
    } catch (error) {
      console.error("Refresh token verification failed:", error);
      return res
        .status(401)
        .json({ EC: 1, EM: "Refresh token expired or invalid" });
    }

    // Get staff info to create new access token
    const staff = await staffDAO.getStaffByID(decoded.id);
    if (!staff) {
      return res.status(401).json({ EC: 1, EM: "Staff not found" });
    }

    // Create new access token
    const payload = {
      id: staff._id,
      email: staff.personalInfo.email,
      name: Buffer.from(staff.personalInfo.fullName, "utf8").toString(),
      address: staff.personalInfo.address,
      phone: staff.personalInfo.phone,
      role: staff.role,
    };

    const access_token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "default-jwt-secret",
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "10m",
      },
    );

    return res.status(200).json({
      EC: 0,
      EM: "Access token refreshed successfully",
      access_token,
    });
  } catch (error) {
    console.error("Controller Error - handleRefreshToken:", error);
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
  handleRefreshToken,
};
