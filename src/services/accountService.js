require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Buffer } = require("buffer");
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

    const personalInfo = {
      fullName: name,
      email,
      phone: phone || "",
      address: address || "",
      gender: gender || "other",
      citizenId: citizenId || "",
    };
    // Only include dob if provided and is a valid date
    if (dob) {
      const d = new Date(dob);
      if (!isNaN(d.getTime())) personalInfo.dob = d;
    }

    const newStaffData = {
      password: hashedPassword,
      role: "candidate",
      personalInfo,
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
      // Ensure name is encoded as UTF-8 string
      name: Buffer.from(staff.personalInfo.fullName, "utf8").toString(),
      address: staff.personalInfo.address,
      phone: staff.personalInfo.phone,
      role: staff.role,
    };

    const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Create refresh token with longer expiration
    const refresh_token = jwt.sign(
      { id: staff._id, email: staff.personalInfo.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN },
    );

    return {
      EC: 0,
      EM: "Login successful",
      access_token,
      refresh_token,
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
const mailer = require("../utils/mailer");

const requestPasswordResetService = async (email) => {
  try {
    const staff = await staffDAO.findByEmail(email);
    // Always return success to avoid leaking whether email exists
    if (!staff)
      return {
        EC: 0,
        EM: "If the email is registered, OTP has been sent.",
      };

    // Tạo OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút as Date

    // Lưu OTP và thời gian hết hạn vào DB (expires is Date)
    const updatedStaff = await staffDAO.setResetTokenByEmail(
      email,
      otp,
      expires,
    );
    // Diagnostic logging: show what was stored in DB (helps debug expiry issues)
    try {
      const stored =
        updatedStaff && updatedStaff.resetPasswordExpires
          ? new Date(updatedStaff.resetPasswordExpires)
          : null;
      console.log(
        `Password reset set for ${email} -> token:${updatedStaff && updatedStaff.resetPasswordToken} expires:${stored ? stored.toISOString() : null}`,
      );
    } catch (logErr) {
      console.warn("Could not log updated resetPasswordExpires:", logErr);
    }

    // Gửi OTP qua email
    const subject = "Password Reset OTP";
    const text = `Your OTP to reset password is: ${otp} (valid for 10 minutes)`;
    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #222;">
        <div style="max-width:680px;margin:0 auto;padding:24px 16px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#1877f2;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:20px;">F</div>
            <div style="font-size:14px;color:#666;">HRM System</div>
          </div>

          <h2 style="margin:8px 0 6px;font-size:20px;color:#111">Thêm một bước nữa để đổi mật khẩu của bạn</h2>

          <p style="color:#444;font-size:14px;">Xin chào,</p>
          <p style="color:#444;font-size:14px;">Chúng tôi đã nhận được yêu cầu đổi mật khẩu của bạn. Hãy nhập mã này vào ứng dụng:</p>

          <div style="margin:18px 0;text-align:center;">
            <div style="display:inline-block;background:#eef6ff;border-radius:8px;padding:18px 36px;border:1px solid #d6e7ff;box-shadow:0 6px 18px rgba(102,126,234,0.12);">
              <span style="letter-spacing:6px;font-size:28px;font-weight:700;color:#0a2540;">${otp}</span>
            </div>
          </div>

          <p style="color:#777;font-size:13px;margin-top:12px">Không chia sẻ mã này với bất kỳ ai.</p>

          <hr style="border:none;border-top:1px solid #eee;margin:20px 0" />

          <p style="font-size:13px;color:#666">Nếu bạn không gửi yêu cầu này, hãy bỏ qua email này hoặc liên hệ bộ phận hỗ trợ.</p>

          <p style="font-size:13px;color:#666;margin-top:18px">Trân trọng,<br/>Đội ngũ HRM System</p>
        </div>
      </div>
    `;

    let mailSent = false;
    try {
      await mailer.sendMail({
        to: staff.personalInfo.email,
        subject,
        text,
        html,
      });
      mailSent = true;
    } catch (mailErr) {
      console.error("Error sending OTP email:", mailErr);
    }
    if (!mailSent) {
      console.warn(`DEV Fallback: OTP for ${email} is ${otp}`);
    }

    return {
      EC: 0,
      EM: "If the email is registered, OTP has been sent.",
    };
  } catch (error) {
    console.error("Service Error - requestPasswordResetService:", error);
    return { EC: -1, EM: "Error processing password reset" };
  }
};

const resetPasswordService = async (email, otp, newPassword) => {
  try {
    const staff = await staffDAO.findByEmail(email);
    if (!staff) return { EC: 1, EM: "Email not found" };

    // Normalize incoming otp to string (trim whitespace) to avoid type/format mismatch
    const otpNormalized =
      otp !== undefined && otp !== null ? otp.toString().trim() : "";

    // Normalize types for stored values
    const storedOtp = (staff.resetPasswordToken || "").toString();
    const expiresAt = staff.resetPasswordExpires
      ? new Date(staff.resetPasswordExpires)
      : null;

    // Diagnostic logging for verification
    console.log(
      `resetPasswordService check for ${email} -> storedOtp:${storedOtp} expiresAt:${expiresAt ? expiresAt.toISOString() : null} now:${new Date().toISOString()}`,
    );

    if (storedOtp !== otpNormalized) {
      console.warn(
        `OTP mismatch for ${email}: provided=${otpNormalized}, stored=${storedOtp}`,
      );
      return { EC: 2, EM: "OTP is invalid" };
    }

    if (!expiresAt || expiresAt.getTime() < Date.now()) {
      console.warn(`OTP expired for ${email}: expiresAt=${expiresAt}`);
      return { EC: 3, EM: "OTP expired" };
    }

    // Hash mật khẩu mới
    const hashed = await bcrypt.hash(newPassword, saltRounds);
    await staffDAO.updatePasswordById(staff._id, hashed);

    // Xóa OTP sau khi reset
    await staffDAO.setResetTokenByEmail(email, null, null);

    return { EC: 0, EM: "Password has been reset successfully" };
  } catch (error) {
    console.error("Service Error - resetPasswordService:", error);
    return { EC: -1, EM: "Error resetting password" };
  }
};

const verifyOtpService = async (email, otp) => {
  try {
    const staff = await staffDAO.findByEmail(email);
    if (!staff) return { EC: 1, EM: "Email not found" };

    // Normalize incoming otp to string and trim
    const otpNormalized =
      otp !== undefined && otp !== null ? otp.toString().trim() : "";

    const storedOtp = (staff.resetPasswordToken || "").toString();
    const expiresAt = staff.resetPasswordExpires
      ? new Date(staff.resetPasswordExpires)
      : null;

    // Diagnostic logging for verification
    console.log(
      `verifyOtpService check for ${email} -> storedOtp:${storedOtp} expiresAt:${expiresAt ? expiresAt.toISOString() : null} now:${new Date().toISOString()}`,
    );

    if (storedOtp !== otpNormalized) {
      console.warn(
        `OTP mismatch for verify ${email}: provided=${otpNormalized}, stored=${storedOtp}`,
      );
      return { EC: 2, EM: "OTP is invalid" };
    }

    if (!expiresAt || expiresAt.getTime() < Date.now()) {
      console.warn(`OTP expired for verify ${email}: expiresAt=${expiresAt}`);
      return { EC: 3, EM: "OTP expired" };
    }

    return { EC: 0, EM: "OTP verified" };
  } catch (error) {
    console.error("Service Error - verifyOtpService:", error);
    return { EC: -1, EM: "Error verifying OTP" };
  }
};

module.exports = {
  handleSignUpService,
  handleLoginService,
  updateProfileService,
  getAccountService,
  requestPasswordResetService,
  resetPasswordService,
  verifyOtpService,
};
