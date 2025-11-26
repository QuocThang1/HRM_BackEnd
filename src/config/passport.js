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
        // Safely extract email and name
        const email =
          (profile &&
            profile.emails &&
            profile.emails[0] &&
            profile.emails[0].value) ||
          "";
        const name =
          (profile && (profile.displayName || profile._json?.name)) || "";
        const googleId = profile && profile.id ? profile.id : "";

        console.log("[Passport] Google callback received:", {
          email,
          name,
          googleId,
        });

        if (!email) {
          console.error(
            "[Passport] Google profile did not contain an email. Aborting login.",
          );
          return done(new Error("No email returned from Google"), null);
        }

        // Check if user exists
        let staff = await staffDAO.findByEmail(email);

        if (!staff) {
          // Create new user
          const randomPassword = Math.random().toString(36).slice(-12);
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          const personalInfo = {
            fullName: name || email,
            email: email,
            phone: "",
            address: "",
            gender: "other",
            citizenId: "",
          };
          // Only include dob if present and a valid date
          if (profile && profile._json && profile._json.birthdate) {
            const d = new Date(profile._json.birthdate);
            if (!isNaN(d.getTime())) personalInfo.dob = d;
          }

          const newStaffData = {
            password: hashedPassword,
            role: "candidate",
            googleId: googleId,
            personalInfo,
          };

          console.log("[Passport] Creating new staff with data:", {
            email,
            name,
          });
          staff = await staffDAO.createStaff(newStaffData);
          console.log("[Passport] New staff created via Google:", {
            id: staff._id,
            email: staff.personalInfo.email,
          });
        } else {
          // Update googleId if not set
          if (!staff.googleId) {
            staff.googleId = googleId;
            await staff.save();
            console.log("[Passport] Updated existing staff with googleId:", {
              id: staff._id,
              email: staff.personalInfo.email,
            });
          }
        }

        return done(null, staff);
      } catch (error) {
        console.error("[Passport] Google OIDC error:", error);
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
            personalInfo: (function () {
              const info = {
                fullName: name,
                email: email,
                phone: "",
                address: "",
                gender: "other",
                citizenId: "",
              };
              if (profile && profile._json && profile._json.birthdate) {
                const d = new Date(profile._json.birthdate);
                if (!isNaN(d.getTime())) info.dob = d;
              }
              return info;
            })(),
          };

          staff = await staffDAO.createStaff(newStaffData);
        } else {
          // Update microsoftId if not set
          if (!staff.microsoftId) {
            staff.microsoftId =
              profile.oid || profile._json?.oid || sub || profile.sub || "";
            await staff.save();
          }
        }
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
