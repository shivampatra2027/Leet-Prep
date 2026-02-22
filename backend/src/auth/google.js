import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

/**
 * DUPLICATE USER PREVENTION
 *
 * Problem: Race condition when multiple OAuth requests happen simultaneously
 * - Request 1: findOne({ email }) → null
 * - Request 2: findOne({ email }) → null (before Request 1 creates user)
 * - Request 1: User.create() → succeeds
 * - Request 2: User.create() → fails with duplicate key error
 *
 * Solution: Use findOneAndUpdate with upsert option
 * - Atomic operation at database level
 * - Only creates user if email doesn't exist
 * - Updates existing user's Google data if they exist
 * - Gracefully handles duplicate key errors
 */

export function configureGoogleStrategy() {
  const isProd = process.env.NODE_ENV === "production";
  const apiPublicUrl = (process.env.API_PUBLIC_URL || "").replace(/\/$/, "");
  const fallbackCallbackUrl = "http://localhost:8080/auth/google/callback";
  const callbackURL =
    isProd && apiPublicUrl
      ? `${apiPublicUrl}/auth/google/callback`
      : process.env.GOOGLE_CALLBACK_URL || fallbackCallbackUrl;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(null, false, { message: "No email found" });
          // if (!email.endsWith("@kiit.ac.in"))
          //     return done(null, false, { message: "Only KIIT email allowed" });

          // Use findOneAndUpdate with upsert to prevent race conditions
          // This is atomic and prevents duplicate user creation
          const user = await User.findOneAndUpdate(
            { email },
            {
              $set: {
                googleId: profile.id,
                name: profile.displayName,
                avatar: profile.photos?.[0]?.value,
              },
              $setOnInsert: {
                email,
                tier: "free",
              },
            },
            {
              upsert: true,
              new: true,
              setDefaultsOnInsert: true,
            },
          );

          console.log("Google OAuth: User authenticated:", email);
          return done(null, user);
        } catch (err) {
          console.error("Google OAuth error:", err);
          // Handle duplicate key errors gracefully
          if (err.code === 11000) {
            // Duplicate key - try to find the existing user
            try {
              const existingUser = await User.findOne({ email });
              if (existingUser) {
                return done(null, existingUser);
              }
            } catch (findErr) {
              return done(findErr);
            }
          }
          return done(err);
        }
      },
    ),
  );

}

export default passport;
