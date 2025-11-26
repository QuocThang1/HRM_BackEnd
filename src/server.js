require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport");

const configViewEngine = require("./config/viewEngine");
const accountRoutes = require("./routes/accountRoutes");
const authRoutes = require("./routes/authRoutes");
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
const auth = require("./middleware/auth");
const connection = require("./config/database");

const app = express();
const port = process.env.PORT || 8080;

/* ---------------------------------------------------
   Body parsers (accept standard JSON and urlencoded payloads)
   Note: using the default `express.json()` ensures requests with
   `Content-Type: application/json` (without explicit charset)
   are parsed. Previously the parser only accepted an exact
   content-type string and caused `req.body` to be empty.
--------------------------------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  // Ensure responses are UTF-8 encoded
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

/* ---------------------------------------------------
   Middleware chung
--------------------------------------------------- */
// CORS - allow frontend origin and allow credentials for session cookie
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Session middleware (passport requires sessions for some strategies)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      // Keep SameSite as 'lax' so top-level navigations (GET) send the cookie.
      // 'none' requires Secure; for local dev we keep 'lax' to avoid being blocked.
      sameSite: "lax",
      // secure should be true in production (HTTPS). For local dev keep false.
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  }),
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Config view engine
configViewEngine(app);

/* ---------------------------------------------------
   Routes
--------------------------------------------------- */

// Public routes
app.use("/v1/api/account", accountRoutes);
app.use("/v1/api/auth", authRoutes);
app.use("/v1/api/chatbot", chatbotRoutes);

// Protected routes
app.use(auth);

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

/* ---------------------------------------------------
   Start server
--------------------------------------------------- */
(async () => {
  try {
    await connection(); // Kết nối MongoDB

    app.listen(port, () => {
      console.log(`Backend Node.js App listening on port ${port}`);

      // Warn if using default secrets
      if (
        !process.env.JWT_SECRET ||
        process.env.JWT_SECRET === "default-jwt-secret"
      ) {
        console.warn(
          "⚠️  WARNING: Using default JWT_SECRET! Set JWT_SECRET in .env file for production.",
        );
      }
      if (
        !process.env.REFRESH_TOKEN_SECRET ||
        process.env.REFRESH_TOKEN_SECRET === "default-refresh-secret"
      ) {
        console.warn(
          "⚠️  WARNING: Using default REFRESH_TOKEN_SECRET! Set REFRESH_TOKEN_SECRET in .env file for production.",
        );
      }
    });
  } catch (error) {
    console.error("Error connecting to DB:", error);
    process.exit(1); // dừng server nếu DB lỗi
  }
})();
