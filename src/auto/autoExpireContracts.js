const cron = require("node-cron");
const contractDAO = require("../DAO/contractDAO");

const startAutoExpireJob = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log(" Running auto-expire contracts job...");
    try {
      await contractDAO.autoExpireContracts();
      console.log("Auto-expire contracts completed");
    } catch (error) {
      console.error("Error in auto-expire job:", error);
    }
  });
};

module.exports = { startAutoExpireJob };
