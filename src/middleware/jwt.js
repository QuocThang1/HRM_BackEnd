require("dotenv").config();
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const while_list = ["/", "/register", "/login"];

  if (while_list.includes(req.path)) {
    return next(); // Skip authentication for whitelisted routes
  }

  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);
      req.staff = {
        email: decoded.email,
        fullName: decoded.fullName,
        address: decoded.address,
        phone: decoded.phone,
        _id: decoded.id,
        role: decoded.role,
      };
      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error("JWT verify failed:", error.message);
      return res.status(401).json({
        message: "Unauthorized access, invalid token",
      });
    }
  } else {
    return res.status(401).json({
      message: "Unauthorized access, no token provided",
    });
  }
};

module.exports = auth;
