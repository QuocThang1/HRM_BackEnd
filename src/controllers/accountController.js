const {
    handleSignUpService,
    handleLoginService,
    getAccountService,
    updateProfileService,
} = require("../services/accountService");

const handleSignUp = async (req, res) => {
    try {
        const { name, email, password, address, phone, gender } = req.body;
        const data = await handleSignUpService(name, email, password, address, phone, gender);
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
        return res.status(200).json(data);
    } catch (error) {
        console.error("Controller Error - handleLogin:", error);
        return res.status(500).json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getAccount = async (req, res) => {
    try {
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
        const { name, email, address, phone } = req.body;
        const staffId = req.staff._id;
        const data = await updateProfileService(staffId, name, email, address, phone);
        return res.status(200).json(data);
    } catch (error) {
        console.error("Controller Error - updateProfile:", error);
        return res.status(500).json({ EC: -1, EM: "Internal Server Error" });
    }
};

module.exports = {
    handleSignUp,
    handleLogin,
    getAccount,
    updateProfile,
};
