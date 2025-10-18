require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const staffDAO = require("../DAO/staffDAO");

const saltRounds = 10;

const handleSignUpService = async (name, email, password, address, phone, gender) => {
    try {
        // Kiểm tra email đã tồn tại chưa
        const existingStaff = await staffDAO.findByEmail(email);
        if (existingStaff) return { EC: 1, EM: "Email already exists" };

        // Hash password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const now = new Date();

        const newStaffData = {
            username: email,
            password: hashedPassword,
            role: "staff",
            personalInfo: {
                fullName: name,
                email,
                phone: phone || "",
                address: address || "",
                gender: gender || "other",
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

const updateProfileService = async (staffId, name, email, address, phone) => {
    try {
        const updateData = {
            "personalInfo.fullName": name,
            "personalInfo.email": email,
            "personalInfo.address": address,
            "personalInfo.phone": phone,
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

module.exports = {
    handleSignUpService,
    handleLoginService,
    updateProfileService,
    getAccountService,
};
