const { chatWithBotService } = require("../services/chatbotService");

const chatWithBot = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.json({ EC: 1, EM: "Message is required" });
        }

        const data = await chatWithBotService(message);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - chatWithBot:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

module.exports = {
    chatWithBot,
};