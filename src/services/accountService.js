require("dotenv").config();
const Staff = require("../models/staff.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const staffDAO = require("../DAO/staffDAO.js");

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
            role: staff.role,
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
                role: staff.role,
            },
        };
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }
};

// CREATE STAFF SERVICE
const handleSignUpService = async (
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
    handleLoginService,
    updateProfileService,
    getAccountService,
    handleSignUpService,
};
