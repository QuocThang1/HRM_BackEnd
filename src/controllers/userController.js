const { createUserService, updateProfileService } = require("../services/userService");
const { handleLoginService } = require("../services/userService");
const { getUserService } = require("../services/userService");
const { getAccountService } = require("../services/userService");


const createUser = async (req, res) => {
    const { name, email, password, address, phone, gender } = req.body;
    const data = await createUserService(name, email, password, address, phone, gender);
    return res.status(200).json(data);
}

const updateProfile = async (req, res) => {
    const { name, email, address, phone } = req.body;
    const userId = req.user._id; // Assuming user ID is stored in req.user
    const data = await updateProfileService(userId, name, email, address, phone);
    return res.status(200).json(data);
}
const handleLogin = async (req, res) => {
    const { email, password } = req.body; // Assuming email and password are sent as query parameters
    const data = await handleLoginService(email, password);
    return res.status(200).json(data);
}

const getUser = async (req, res) => {
    const data = await getUserService();
    return res.status(200).json(data);
}

const getAccount = async (req, res) => {
    const userId = req.user._id;
    const data = await getAccountService(userId);
    return res.status(200).json(data);
}

module.exports = {
    createUser
    , handleLogin
    , getUser
    , getAccount
    , updateProfile
}