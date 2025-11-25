require("dotenv").config();
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const while_list = ["/v1/api/account/register", "/v1/api/account/login"];

  if (while_list.includes(req.path)) {
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
