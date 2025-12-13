import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";


// console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
// console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);
// console.log("GOOGLE_CALLBACK_URL:", process.env.GOOGLE_CALLBACK_URL);
console.log("Google OAuth is implemented..!")
export function configureGoogleStrategy() {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;
                    if (!email) return done(null, false, { message: "No email found" });
                    if (!email.endsWith("@kiit.ac.in"))
                        return done(null, false, { message: "Only KIIT email allowed" });

                    let user = await User.findOne({ email });
                    if (!user) {
                        user = await User.create({
                            email,
                            googleId: profile.id,
                            name: profile.displayName,
                            avatar: profile.photos?.[0]?.value,
                        });
                    }
                    return done(null, user);
                } catch (err) {
                    return done(err);
                }
            }
        )
    );

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
}

export default passport;
