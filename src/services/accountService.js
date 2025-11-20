require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const staffDAO = require("../DAO/staffDAO");

const saltRounds = 10;

const handleSignUpService = async (
  name,
  email,
  password,
  address,
  phone,
  gender,
  citizenId,
  dob,
) => {
  try {
    // Kiểm tra email đã tồn tại chưa
    const existingStaff = await staffDAO.findByEmail(email);
    if (existingStaff) return { EC: 1, EM: "Email already exists" };

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const now = new Date();

    const newStaffData = {
      password: hashedPassword,
      role: "candidate",
      personalInfo: {
        fullName: name,
        email,
        phone: phone || "",
        address: address || "",
        gender: gender || "other",
        citizenId: citizenId || "",
        dob: dob || null,
      },
      created_at: now,
      updated_at: now,
    };

    const newStaff = await staffDAO.createStaff(newStaffData);
    return { EC: 0, EM: "Staff created successfully", staff: newStaff };
  } catch (error) {
    console.error("Service Error - handleSignUpService:", error);
    return { EC: -1, EM: "Error creating staff" };
  }
};

const handleLoginService = async (email, password) => {
  try {
    const staff = await staffDAO.findByEmail(email);
    if (!staff) return { EC: 1, EM: "Email or Password is not correct" };

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) return { EC: 2, EM: "Email or Password is not correct" };

    const payload = {
      id: staff._id,
      email: staff.personalInfo.email,
      name: staff.personalInfo.fullName,
      address: staff.personalInfo.address,
      phone: staff.personalInfo.phone,
      role: staff.role,
    };

    const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return {
      EC: 0,
      EM: "Login successful",
      access_token,
      staff: {
        email: staff.personalInfo.email,
        name: staff.personalInfo.fullName,
        address: staff.personalInfo.address,
        phone: staff.personalInfo.phone,
        role: staff.role,
      },
    };
  } catch (error) {
    console.error("Service Error - handleLoginService:", error);
    return { EC: -1, EM: "Error during login" };
  }
};

const updateProfileService = async (
  staffId,
  name,
  email,
  address,
  phone,
  citizenId,
  dob,
  gender,
) => {
  try {
    const updateData = {
      "personalInfo.fullName": name,
      "personalInfo.email": email,
      "personalInfo.address": address,
      "personalInfo.phone": phone,
      "personalInfo.citizenId": citizenId,
      "personalInfo.dob": dob,
      "personalInfo.gender": gender,
    };

    const updatedStaff = await staffDAO.updateProfile(staffId, updateData);
    if (!updatedStaff) return { EC: 1, EM: "Staff not found" };

    return { EC: 0, EM: "Profile updated successfully", staff: updatedStaff };
  } catch (error) {
    console.error("Service Error - updateProfileService:", error);
    return { EC: -1, EM: "Error updating profile" };
  }
};

const getAccountService = async (staffId) => {
  try {
    const staff = await staffDAO.getStaffByID(staffId);
    if (!staff) return { EC: 1, EM: "Staff not found" };
    return { EC: 0, EM: "Success", data: staff };
  } catch (error) {
    console.error("Service Error - getAccountService:", error);
    return { EC: -1, EM: "Error fetching account info" };
  }
};

// Forgot / Reset password services
const crypto = require("crypto");
const mailer = require("../utils/mailer");

const requestPasswordResetService = async (email, frontendUrl) => {
  try {
    const staff = await staffDAO.findByEmail(email);
    // Always return success to avoid leaking whether email exists
    if (!staff)
      return {
        EC: 0,
        EM: "If the email is registered, reset instructions have been sent.",
      };

    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 3600 * 1000; // 1 hour

    await staffDAO.setResetTokenByEmail(email, token, expires);

    // Prepare reset link
    const resetLink = `${frontendUrl.replace(/\/$/, "")}/reset-password?token=${token}`;

    const subject = "Password reset request";
    const text = `You requested a password reset. Visit: ${resetLink}`;
    const html = `<p>You requested a password reset. Click the link below to reset your password (valid for 1 hour):</p><p><a href="${resetLink}">${resetLink}</a></p>`;

    try {
      await mailer.sendMail({
        to: staff.personalInfo.email,
        subject,
        text,
        html,
      });
    } catch (mailErr) {
      console.error("Error sending reset email:", mailErr);
      // continue silently
    }

    return {
      EC: 0,
      EM: "If the email is registered, reset instructions have been sent.",
    };
  } catch (error) {
    console.error("Service Error - requestPasswordResetService:", error);
    return { EC: -1, EM: "Error processing password reset" };
  }
};

const resetPasswordService = async (token, newPassword) => {
  try {
    const staff = await staffDAO.findByResetToken(token);
    if (!staff) return { EC: 1, EM: "Token is invalid or expired" };

    const hashed = await bcrypt.hash(newPassword, saltRounds);
    await staffDAO.updatePasswordById(staff._id, hashed);

    return { EC: 0, EM: "Password has been reset successfully" };
  } catch (error) {
    console.error("Service Error - resetPasswordService:", error);
    return { EC: -1, EM: "Error resetting password" };
  }
};

module.exports = {
  handleSignUpService,
  handleLoginService,
  updateProfileService,
  getAccountService,
  requestPasswordResetService,
  resetPasswordService,
};
