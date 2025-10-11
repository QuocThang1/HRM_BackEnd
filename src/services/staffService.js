require("dotenv").config();
const Staff = require("../models/staff.js");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const staffDAO = require("../DAO/staffDAO.js");

// CREATE STAFF SERVICE
const createStaffService = async (
  name,
  email,
  password,
  address,
  phone,
  gender,
) => {
  try {
    // Check if the staff already exists
    const existingStaff = await Staff.findOne({ "personalInfo.email": email });
    if (existingStaff) {
      return { EC: 1, EM: "Email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const now = new Date();

    const newStaff = new Staff({
      username: email, // username = email
      password: hashedPassword,
      role: "staff", // default role
      personalInfo: {
        fullName: name,
        email,
        phone: phone || "",
        address: address || "",
        gender: gender || "other",
      },
      // employment_info: {}
      // candidate_info: {}
      created_at: now,
      updated_at: now,
    });

    await newStaff.save();
    return { EC: 0, EM: "Staff created successfully", staff: newStaff };
  } catch (error) {
    console.error(
      "Error creating staff:",
      JSON.stringify(error.errInfo, null, 2),
    );
    return { EC: -1, EM: "Error creating staff", error };
  }
};

const updateProfileService = async (staffId, name, email, address, phone) => {
  try {
    const updateData = {
      "personalInfo.fullName": name,
      "personalInfo.email": email,
      "personalInfo.address": address,
      "personalInfo.phone": phone,
    };

    const updatedStaff = await staffDAO.updateProfile(staffId, updateData);

    if (!updatedStaff) {
      return { EC: 1, EM: "Staff not found" };
    }

    return { EC: 0, EM: "Profile updated successfully", staff: updatedStaff };
  } catch (error) {
    console.error("Error in Service updateProfileService:", error);
    return { EC: 2, EM: "Error updating profile" };
  }
};
// LOGIN SERVICE
const handleLoginService = async (email, password) => {
  try {
    const staff = await Staff.findOne({ "personalInfo.email": email });
    if (!staff) return { EC: 1, EM: "Email or Password is not correct" };

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) return { EC: 2, EM: "Email or Password is not correct" };

    const payload = {
      email: staff.personalInfo.email,
      name: staff.personalInfo.fullName,
      address: staff.personalInfo.address,
      phone: staff.personalInfo.phone,
      id: staff._id,
    };

    const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return {
      EC: 0,
      access_token,
      staff: {
        email: staff.personalInfo.email,
        name: staff.personalInfo.fullName,
        address: staff.personalInfo.address,
        phone: staff.personalInfo.phone,
      },
    };
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

// GET ALL STAFFS
const getStaffService = async () => {
  try {
    const staffs = await Staff.find({})
      .select("username role personalInfo.fullName personalInfo.email")
      .lean();

    const result = staffs.map((s) => ({
      _id: s._id,
      username: s.username,
      role: s.role,
      fullName: s.personalInfo?.fullName || "",
      email: s.personalInfo?.email || "",
    }));

    return result;
  } catch (error) {
    console.error("Error retrieving staffs:", error);
    return null;
  }
};

// GET ACCOUNT BY ID
const getAccountService = async (staffId) => {
  try {
    const staff = await staffDAO.getStaffByID(staffId);
    return staff;
  } catch (error) {
    console.error(error);
    return error;
  }
};

const addNewEmployeeService = async ({ username, password, fullName, email, phone, address }) => {
  try {
    // Check trùng email
    const existing = await staffDAO.findByEmail(email);
    if (existing) {
      throw new Error("Email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Chuẩn bị data
    const staffData = {
      username,
      password: hashedPassword,
      personalInfo: {
        fullName,
        email,
        phone,
        address,
      },
    };

    // Tạo mới staff
    const newStaff = await staffDAO.createStaff(staffData);
    return newStaff;
  } catch (error) {
    console.error("Error in addNewEmployeeService:", error);
    throw error;
  }
};

module.exports = {
  createStaffService,
  handleLoginService,
  getStaffService,
  updateProfileService,
  getAccountService,
  addNewEmployeeService,
};
