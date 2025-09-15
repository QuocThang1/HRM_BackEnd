require("dotenv").config();
const mongoose = require("mongoose");

const dbState = [
  { value: 0, label: "Disconnected" },
  { value: 1, label: "Connected" },
  { value: 2, label: "Connecting" },
  { value: 3, label: "Disconnecting" },
];

const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL);

    // Bắt sự kiện error để tránh crash
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    const state = mongoose.connection.readyState;
    console.log(
      `MongoDB status: ${dbState.find((f) => f.value === state).label}`,
    );
  } catch (error) {
    console.error("Error connecting to DB:", error.message);
    process.exit(1);
  }
};

module.exports = connection;
