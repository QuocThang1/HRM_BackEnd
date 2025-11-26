const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Debug helper: log incoming auth requests (useful during development)
const logAuthRequest = (req, res, next) => {
  try {
    console.log("[AuthRoute]", req.method, req.originalUrl);
    console.log("[AuthRoute] headers:", {
      host: req.headers.host,
      referer: req.headers.referer,
      origin: req.headers.origin,
    });
    console.log("[AuthRoute] sessionID:", req.sessionID);
  } catch (e) {
    console.warn("[AuthRoute] logging failed", e);
  }
  next();
};

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
  logAuthRequest,
  passport.authenticate("azuread-openidconnect", {
    // passport-azure-ad uses a custom strategy name; ensure it matches the one registered
    prompt: "select_account",
    // ensure session is enabled so state/nonce are stored
    session: true,
  }),
);

const microsoftCallbackHandler = [
  logAuthRequest,
  (req, res, next) => {
    console.log(
      "[AuthRoute] Before passport.authenticate, req.user:",
      req.user,
    );
    next();
  },
  passport.authenticate("azuread-openidconnect", {
    session: true,
    failureRedirect: "/login",
    failureMessage: true,
  }),
  (req, res, next) => {
    console.log("[AuthRoute] After passport.authenticate, req.user:", req.user);
    if (!req.user) {
      console.error("[AuthRoute] req.user is null after authentication!");
      return res.status(401).json({ error: "Authentication failed: no user" });
    }
    next();
  },
  (req, res) => {
    try {
      const staff = req.user;
      console.log("[AuthRoute] Generating JWT for staff:", {
        id: staff._id,
        email: staff.personalInfo?.email,
      });

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

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      console.log(
        "[AuthRoute] Redirecting to:",
        `${frontendUrl}/login?token=***&provider=microsoft`,
      );
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
