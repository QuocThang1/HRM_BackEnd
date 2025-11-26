const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    try {
      const staff = req.user;

      // Generate JWT token
      const payload = {
        id: staff._id,
        email: staff.personalInfo.email,
        name: staff.personalInfo.fullName,
        address: staff.personalInfo.address,
        phone: staff.personalInfo.phone,
        role: staff.role,
      };

      const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "10m",
      });

      // Generate refresh token
      const refresh_token = jwt.sign(
        { id: staff._id, email: staff.personalInfo.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d" },
      );

      // Redirect to frontend with tokens
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(
        `${frontendUrl}/login?token=${access_token}&refresh_token=${refresh_token}&provider=google`,
      );
    } catch (error) {
      console.error("Google callback error:", error);
      res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=auth_failed`,
      );
    }
  },
);

// Microsoft OAuth Routes (using passport-azure-ad OIDC strategy)
router.get(
  "/microsoft",
  passport.authenticate("azuread-openidconnect", {
    // passport-azure-ad uses a custom strategy name; ensure it matches the one registered
    prompt: "select_account",
    // ensure session is enabled so state/nonce are stored
    session: true,
  }),
);

const microsoftCallbackHandler = [
  (req, res, next) => {
    next();
  },
  passport.authenticate("azuread-openidconnect", {
    session: true,
    failureRedirect: "/login",
    failureMessage: true,
  }),
  (req, res, next) => {
    if (!req.user) {
      console.error("[AuthRoute] req.user is null after authentication!");
      return res.status(401).json({ error: "Authentication failed: no user" });
    }
    next();
  },
  (req, res) => {
    try {
      const staff = req.user;

      // Generate JWT token
      const payload = {
        id: staff._id,
        email: staff.personalInfo.email,
        name: staff.personalInfo.fullName,
        address: staff.personalInfo.address,
        phone: staff.personalInfo.phone,
        role: staff.role,
      };

      const access_token = jwt.sign(
        payload,
        process.env.JWT_SECRET || "default-jwt-secret",
        {
          expiresIn: process.env.JWT_EXPIRES_IN || "10m",
        },
      );

      // Generate refresh token
      const refresh_token = jwt.sign(
        { id: staff._id, email: staff.personalInfo.email },
        process.env.REFRESH_TOKEN_SECRET ||
          process.env.JWT_SECRET ||
          "default-refresh-secret",
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d" },
      );

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(
        `${frontendUrl}/login?token=${access_token}&refresh_token=${refresh_token}&provider=microsoft`,
      );
    } catch (error) {
      console.error("Microsoft callback error:", error);
      res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=auth_failed`,
      );
    }
  },
];

// Accept both GET and POST callbacks (Azure may use query or form_post responseMode)
router.get("/microsoft/callback", ...microsoftCallbackHandler);
router.post("/microsoft/callback", ...microsoftCallbackHandler);

module.exports = router;
