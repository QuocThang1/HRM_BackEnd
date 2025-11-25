require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { OIDCStrategy } = require("passport-azure-ad");
const staffDAO = require("../DAO/staffDAO");
const bcrypt = require("bcrypt");

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/v1/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let staff = await staffDAO.findByEmail(profile.emails[0].value);

        if (!staff) {
          // Create new user
          const email = profile.emails[0].value;
          const name = profile.displayName;
          const googleId = profile.id;

          // Generate a random password for OAuth users
          const randomPassword = Math.random().toString(36).slice(-12);
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          const newStaffData = {
            password: hashedPassword,
            role: "candidate",
            googleId: googleId,
            personalInfo: {
              fullName: name,
              email: email,
              phone: "",
              address: "",
              gender: "other",
              citizenId: "",
              dob: null,
            },
          };

          staff = await staffDAO.createStaff(newStaffData);
        } else {
          // Update googleId if not set
          if (!staff.googleId) {
            staff.googleId = profile.id;
            await staff.save();
          }
        }

        return done(null, staff);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

// Microsoft (Azure AD) OIDC Strategy
console.log(
  "[Passport Init] Microsoft OIDC - redirectUrl:",
  `${process.env.BACKEND_URL}/v1/api/auth/microsoft/callback`,
);
passport.use(
  new OIDCStrategy(
    {
      identityMetadata:
        process.env.MICROSOFT_IDENTITY_METADATA ||
        "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
      clientID: process.env.MICROSOFT_CLIENT_ID,
      responseType: "code",
      responseMode: "query",
      redirectUrl: `${process.env.BACKEND_URL}/v1/api/auth/microsoft/callback`,
      allowHttpForRedirectUrl: true,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      scope: ["profile", "offline_access", "openid", "email"],
      validateIssuer: false,
    },
    async (iss, sub, profile, accessToken, refreshToken, params, done) => {
      try {
        // Attempt to extract email and name from profile
        const email =
          (profile &&
            (profile._json?.email || profile._json?.preferred_username)) ||
          (profile && profile.emails && profile.emails[0]) ||
          "";
        const name =
          (profile && (profile.displayName || profile._json?.name)) || "";

        console.log("[Passport] Microsoft OIDC callback received:", {
          email,
          name,
          profileOid: profile?.oid || profile?._json?.oid,
          sub,
        });

        let staff = null;
        if (email) staff = await staffDAO.findByEmail(email);

        if (!staff) {
          // Create new user
          const randomPassword = Math.random().toString(36).slice(-12);
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          const newStaffData = {
            password: hashedPassword,
            role: "candidate",
            microsoftId:
              profile.oid || profile._json?.oid || sub || profile.sub || "",
            personalInfo: {
              fullName: name,
              email: email,
              phone: "",
              address: "",
              gender: "other",
              citizenId: "",
              dob: null,
            },
          };

          staff = await staffDAO.createStaff(newStaffData);
          console.log("[Passport] New staff created:", {
            email,
            id: staff._id,
          });
        } else {
          // Update microsoftId if not set
          if (!staff.microsoftId) {
            staff.microsoftId =
              profile.oid || profile._json?.oid || sub || profile.sub || "";
            await staff.save();
            console.log("[Passport] Existing staff updated:", {
              email,
              id: staff._id,
            });
          } else {
            console.log("[Passport] Existing staff found:", {
              email,
              id: staff._id,
            });
          }
        }

        console.log("[Passport] Returning staff to done callback:", {
          email,
          id: staff._id,
        });
        return done(null, staff);
      } catch (error) {
        console.error("[Passport] Microsoft OIDC error:", error.message, error);
        return done(error, null);
      }
    },
  ),
);

// Serialize and deserialize user
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
