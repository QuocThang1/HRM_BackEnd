require("dotenv").config();
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const while_list = [
    "/v1/api/account/register",
    "/v1/api/account/login",
    "/v1/api/account/forgot-password",
    "/v1/api/account/verify-otp",
    "/v1/api/account/reset-password",
    "/v1/api/account/refresh-token",
    "/v1/api/auth/google",
    "/v1/api/auth/google/callback",
    "/v1/api/auth/microsoft",
    "/v1/api/auth/microsoft/callback",
  ];

  // Check full path using req.originalUrl (includes query string, but we only care about path)
  const fullPath = req.originalUrl.split("?")[0]; // Remove query string
  if (while_list.includes(fullPath)) {
    return next(); // Skip authentication for whitelisted routes
  }

  if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized access, invalid token format" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized access, no token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.staff = {
        email: decoded.email,
        name: decoded.name,
        address: decoded.address,
        phone: decoded.phone,
        _id: decoded.id,
        role: decoded.role,
      };
      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      // Avoid leaking internal error details in logs for malformed tokens
      console.warn("JWT verify failed:", error.message);
      return res
        .status(401)
        .json({ message: "Unauthorized access, invalid token" });
    }
  } else {
    return res.status(401).json({
      message: "Unauthorized access, no token provided",
    });
  }
};

module.exports = auth;
