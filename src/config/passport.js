require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { OIDCStrategy } = require("passport-azure-ad");
const staffDAO = require("../DAO/staffDAO");
const bcrypt = require("bcrypt");
const { URL } = require("node:url");

// ===============================
// Helper: Check URL hợp lệ
// ===============================
function isValidUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// ===============================
// GOOGLE STRATEGY (SAFE LOADING)
// ===============================
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  isValidUrl(process.env.BACKEND_URL)
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/v1/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email =
            profile?.emails?.[0]?.value ||
            profile?._json?.email ||
            profile?._json?.preferred_username ||
            "";

          const name = profile?.displayName || profile?._json?.name || "";
          const googleId = profile?.id || "";

          if (!email)
            return done(new Error("No email returned from Google"), null);

          let staff = await staffDAO.findByEmail(email);

          if (!staff) {
            const randomPassword = Math.random().toString(36).slice(-12);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            const newStaffData = {
              password: hashedPassword,
              role: "candidate",
              googleId,
              personalInfo: {
                fullName: name || email,
                email,
                phone: "",
                address: "",
                gender: "other",
                citizenId: "",
              },
            };

            staff = await staffDAO.createStaff(newStaffData);
          } else if (!staff.googleId) {
            staff.googleId = googleId;
            await staff.save();
          }

          return done(null, staff);
        } catch (error) {
          console.error("[Passport] Google OIDC error:", error);
          return done(error, null);
        }
      },
    ),
  );
} else {
  console.warn(
    "[WARN] Google OAuth disabled — Missing GOOGLE CLIENT or BACKEND_URL",
  );
}

// ===============================
// AZURE AD STRATEGY (SAFE LOADING)
// ===============================
if (
  process.env.MICROSOFT_CLIENT_ID &&
  process.env.MICROSOFT_CLIENT_SECRET &&
  isValidUrl(process.env.BACKEND_URL)
) {
  const redirectUrl = `${process.env.BACKEND_URL}/v1/api/auth/microsoft/callback`;

  passport.use(
    new OIDCStrategy(
      {
        identityMetadata:
          process.env.MICROSOFT_IDENTITY_METADATA ||
          "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",

        clientID: process.env.MICROSOFT_CLIENT_ID,
        responseType: "code",
        responseMode: "query",
        redirectUrl,

        allowHttpForRedirectUrl: true,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        scope: ["profile", "offline_access", "openid", "email"],
        validateIssuer: false,
      },
      async (iss, sub, profile, accessToken, refreshToken, params, done) => {
        try {
          const email =
            profile?._json?.email ||
            profile?._json?.preferred_username ||
            profile?.emails?.[0] ||
            "";

          const name = profile?.displayName || profile?._json?.name || "";

          let staff = email ? await staffDAO.findByEmail(email) : null;

          if (!staff) {
            const randomPassword = Math.random().toString(36).slice(-12);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            staff = await staffDAO.createStaff({
              password: hashedPassword,
              role: "candidate",
              microsoftId:
                profile?.oid ||
                profile?._json?.oid ||
                sub ||
                profile?.sub ||
                "",
              personalInfo: {
                fullName: name,
                email,
                phone: "",
                address: "",
                gender: "other",
                citizenId: "",
              },
            });
          } else if (!staff.microsoftId) {
            staff.microsoftId =
              profile?.oid || profile?._json?.oid || sub || profile?.sub || "";
            await staff.save();
          }

          return done(null, staff);
        } catch (error) {
          console.error("[Passport] Microsoft OIDC error:", error);
          return done(error, null);
        }
      },
    ),
  );
} else {
  console.warn(
    "[WARN] Microsoft OAuth disabled — Missing MICROSOFT CLIENT or BACKEND_URL",
  );
}

// ===============================
// SESSION
// ===============================
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await staffDAO.getStaffByID(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
