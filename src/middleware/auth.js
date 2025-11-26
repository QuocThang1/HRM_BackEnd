require("dotenv").config();
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
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
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "default-jwt-secret",
      );
      req.staff = {
        email: decoded.email,
        name: decoded.name,
        address: decoded.address,
        phone: decoded.phone,
        _id: decoded.id,
        role: decoded.role,
      };

      // Generate a new token with extended expiration (sliding window)
      const newPayload = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        address: decoded.address,
        phone: decoded.phone,
        role: decoded.role,
      };

      const newToken = jwt.sign(
        newPayload,
        process.env.JWT_SECRET || "default-jwt-secret",
        {
          expiresIn: process.env.JWT_EXPIRES_IN || "10m",
        },
      );

      // Attach new token to response header
      res.setHeader("X-New-Token", newToken);

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      // Avoid leaking internal error details in logs for malformed tokens
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
