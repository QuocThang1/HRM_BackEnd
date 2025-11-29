require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("./config/passport");

const configViewEngine = require("./config/viewEngine");
const accountRoutes = require("./routes/accountRoutes");
const authRoutes = require("./routes/authRoutes");
const staffRoutes = require("./routes/staffRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const contractRoutes = require("./routes/contractRoutes");
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
const todoRoutes = require("./routes/todoRoutes");
const auth = require("./middleware/auth");
const connection = require("./config/database");

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  // Ensure responses are UTF-8 encoded
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

console.log("🔍 FRONTEND_URL loaded from ENV:", process.env.FRONTEND_URL);
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173"];

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        return callback(new Error("CORS not allowed: " + origin), false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 200,
  }),
);

app.options("*", cors());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_DB_URL,
      touchAfter: 24 * 3600, // lazy session update (seconds)
    }),
    cookie: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  }),
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Config view engine
configViewEngine(app);

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
app.use("/v1/api/contracts", contractRoutes);
app.use("/v1/api/attendances", attendanceRoutes);
app.use("/v1/api/resignations", resignationRoutes);
app.use("/v1/api/salaries", salaryRoutes);
app.use("/v1/api/monthly-salaries", monthlySalaryRoutes);
app.use("/v1/api/policies", policyRoutes);
app.use("/v1/api/todos", todoRoutes);

(async () => {
  try {
    await connection(); // Kết nối MongoDB

    app.listen(port, () => {
      console.log(`Backend Node.js App listening on port ${port}`);
    });
  } catch (error) {
    console.error("Error connecting to DB:", error);
    process.exit(1); // dừng server nếu DB lỗi
  }
})();
