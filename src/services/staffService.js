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
    const existingStaff = await Staff.findOne({ "personal_info.email": email });
    if (existingStaff) {
      return { EC: 1, EM: "Email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const now = new Date();

    const newStaff = new Staff({
      username: email, // username = email
      password: hashedPassword,
      role: "staff", // default role
      personal_info: {
        full_name: name,
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

// UPDATE PROFILE SERVICE
const updateProfileService = async (
  staffId,
  name,
  email,
  address,
  phone,
  gender,
) => {
  try {
    const updatedStaff = await Staff.findByIdAndUpdate(
      staffId,
      {
        "personal_info.full_name": name,
        "personal_info.email": email,
        "personal_info.address": address,
        "personal_info.phone": phone,
        "personal_info.gender": gender,
      },
      { new: true, runValidators: true }, // đảm bảo validate theo schema
    ).select("-password");

    if (!updatedStaff) {
      return { EC: 1, EM: "Staff not found" };
    }

    return { EC: 0, EM: "Profile updated successfully", staff: updatedStaff };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { EC: 2, EM: "Error updating profile" };
  }
};

// LOGIN SERVICE
const handleLoginService = async (email, password) => {
  try {
    const staff = await Staff.findOne({ "personal_info.email": email });
    if (!staff) return { EC: 1, EM: "Email or Password is not correct" };

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) return { EC: 2, EM: "Email or Password is not correct" };

    const payload = {
      email: staff.personal_info.email,
      name: staff.personal_info.full_name,
      address: staff.personal_info.address,
      phone: staff.personal_info.phone,
      id: staff._id,
    };

    const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return {
      EC: 0,
      access_token,
      staff: {
        email: staff.personal_info.email,
        name: staff.personal_info.full_name,
        address: staff.personal_info.address,
        phone: staff.personal_info.phone,
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
      .select("username role personal_info.full_name personal_info.email")
      .lean();

    const result = staffs.map((s) => ({
      _id: s._id,
      username: s.username,
      role: s.role,
      full_name: s.personal_info?.full_name || "",
      email: s.personal_info?.email || "",
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

module.exports = {
  createStaffService,
  handleLoginService,
  getStaffService,
  updateProfileService,
  getAccountService,
};
