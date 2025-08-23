require("dotenv").config(); // Load environment variables
const User = require("../models/user");
const bcrypt = require("bcrypt"); // for hashing passwords
const saltRounds = 10; // bcrypt salt rounds
const jwt = require("jsonwebtoken"); // for creating tokens
const userDAO = require("../DAO/userDAO.js"); // Importing user DAO for database operations

const createUserService = async (name, email, password, address, phone, gender) => {
    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return {
                EC: 1,
                EM: "Email already exists",
            };
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // Create a new user instance
        let newUser = new User({
            name: name,
            email: email,
            password: hashedPassword,
            address: address,
            phone: phone,
            gender: gender,
            role: "user" // default role
        });

        // Save the user to the database
        await newUser.save();
        return newUser;

    } catch (error) {
        console.error("Error creating user:", error);
    }

}

const updateProfileService = async (userId, name, email, address, phone) => {
    try {
        // Find the user by ID and update their profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email, address, phone },
            { new: true } // Return the updated document
        ).select("-password"); // Exclude password field from the response
        if (!updatedUser) {
            return {
                EC: 1,
                EM: "User not found",
            };
        }
        return {
            EC: 0,
            EM: "Profile updated successfully",
            user: updatedUser,
        };
    } catch (error) {
        console.error("Error updating profile:", error);
        return {
            EC: 2,
            EM: "Error updating profile",
        };
    }
}


const handleLoginService = async (email, password) => {
    try {
        // Find the user by email
        const user = await User.findOne({ email: email });
        if (!user) {
            return {
                EC: 1,
                EM: "Email, Password is not correct",
            }
        }
        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return {
                EC: 2,
                EM: "Email, Password is not correct",
            }
        } else {
            const payload = {
                email: user.email,
                name: user.name,
                address: user.address,
                phone: user.phone,
                id: user._id,
            }
            const access_token = jwt.sign(
                payload
                , process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
            );
            return {
                EC: 0,
                access_token,
                user: {
                    email: user.email,
                    name: user.name,
                    address: user.address,
                    phone: user.phone,
                },
            }
        }
    } catch (error) {
        console.error("Error during login:", error);
        throw error; // rethrow the error to be handled by the controller
    }
}

const getUserService = async () => {
    try {
        // Retrieve all users from the database
        const users = await User.find({}).select("-password"); // Exclude password field
        return users;
    } catch (error) {
        console.error("Error retrieving users:", error);
        return null;
    }
}

const getAccountService = async (userId) => {
    try {
        const userID = userId // lấy từ middleware auth
        const user = await userDAO.getUserByID(userID);
        return user;
    } catch (error) {
        console.error(error);
        return error;
    }
}



module.exports = {
    createUserService
    , handleLoginService
    , getUserService
    , updateProfileService
    , getAccountService
}