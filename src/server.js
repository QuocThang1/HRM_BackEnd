require("dotenv").config();
const express = require("express");
const cors = require("cors");

const configViewEngine = require("./config/viewEngine");
const accountRoutes = require("./routes/accountRoutes");
const staffRoutes = require("./routes/staffRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const departmentReviewRoutes = require("./routes/departmentReviewRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const departmentShiftRoutes = require("./routes/departmentShiftRoutes");
const shiftTypeRoutes = require("./routes/shiftTypeRoutes");
const shiftAssignmentRoutes = require("./routes/shiftAssignmentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const resignationRoutes = require("./routes/resignationRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const monthlySalaryRoutes = require("./routes/monthlySalaryRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const policyRoutes = require("./routes/policyRoutes");
const contractRoutes = require("./routes/contractRoutes");

const { startAutoExpireJob } = require("./auto/autoExpireContracts");
const auth = require("./middleware/auth");
const connection = require("./config/database");

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse form-data

// Config view engine
configViewEngine(app);

app.use("/v1/api/chatbot", chatbotRoutes);

app.use(auth);

// Routes
app.use("/v1/api/account", accountRoutes);
app.use("/v1/api/staff", staffRoutes);
app.use("/v1/api/departments", departmentRoutes);
app.use("/v1/api/department-reviews", departmentReviewRoutes);
app.use("/v1/api/candidates", candidateRoutes);
app.use("/v1/api/department-shifts", departmentShiftRoutes);
app.use("/v1/api/shift-types", shiftTypeRoutes);
app.use("/v1/api/shift-assignments", shiftAssignmentRoutes);
app.use("/v1/api/attendances", attendanceRoutes);
app.use("/v1/api/resignations", resignationRoutes);
app.use("/v1/api/salaries", salaryRoutes);
app.use("/v1/api/monthly-salaries", monthlySalaryRoutes);
app.use("/v1/api/policies", policyRoutes);
app.use("/v1/api/contracts", contractRoutes);

// Start server
(async () => {
  try {
    await connection(); // Kết nối MongoDB

    startAutoExpireJob();

    app.listen(port, () => {
      console.log(`Backend Node.js App listening on port ${port}`);
    });
  } catch (error) {
    console.error("Error connecting to DB:", error);
    process.exit(1); // thoát app nếu DB fail
  }
})();
