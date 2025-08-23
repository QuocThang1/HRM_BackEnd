const User = require("../models/user");

class UserDAO {
    async getUserByID(userId) {
        try {
            const user = await User.findById(userId).select('-password');
            return user;
        } catch (error) {
            console.error("Error fetching user by ID:", error);
            throw error;
        }
    }
}

module.exports = new UserDAO();