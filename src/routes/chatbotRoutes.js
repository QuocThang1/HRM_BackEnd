const express = require("express");
const { chatWithBot } = require("../controllers/chatbotController");

const routerAPI = express.Router();

routerAPI.post("/chat", chatWithBot);

module.exports = routerAPI;
