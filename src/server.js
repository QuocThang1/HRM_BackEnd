require("dotenv").config();
const express = require("express");
const cors = require("cors");

const configViewEngine = require("./config/viewEngine");
const apiRoutes = require("./routes/api");
const connection = require("./config/database");
const { getHomepage } = require("./controllers/homeController");

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse form-data

// Config view engine
configViewEngine(app);

// Routes
const webAPI = express.Router();
webAPI.get("/", getHomepage);

app.use("/", webAPI);
app.use("/v1/api", apiRoutes); // bỏ / cuối cho chuẩn

// Start server
(async () => {
  try {
    await connection(); // Kết nối MongoDB

    app.listen(port, () => {
      console.log(`Backend Node.js App listening on port ${port}`);
    });
  } catch (error) {
    console.error("Error connecting to DB:", error);
    process.exit(1); // thoát app nếu DB fail
  }
})();
