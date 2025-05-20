import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { USERLOGIN_TYPES } from "../constants.js";

try {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, next) => {
        try {
          const email = profile.emails[0].value;
          let user = await User.findOne({ email });

          if (!user) {
            user = await User.create({
              email,
              fullName: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`,
              loginType: [USERLOGIN_TYPES.GOOGLE],
              googleId: profile.id
            });
          } else {
            if (!user.loginType.includes(USERLOGIN_TYPES.GOOGLE)) {
              user.loginType.push(USERLOGIN_TYPES.GOOGLE);
              user.googleId = profile.id;
              await user.save();
            }
          }

          return next(null, user);
        } catch (error) {
          return next(new ApiError(500, "Google login failed", error));
        }
      }
    )
  );
} catch (error) {
}
export default passport;