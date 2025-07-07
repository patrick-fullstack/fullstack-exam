import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User, IUser } from "../models/User";

interface CustomVerifyOptions {
  message: string;
  actualRole?: string;
}

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email: string, password: string, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() })
          .select("+password")
          .populate("companyId", "name email website logo");

        if (!user) {
          return done(null, false, {
            message: "Invalid email or password",
          } as CustomVerifyOptions);
        }

        if (!user.isActive) {
          return done(null, false, {
            message: "Account is deactivated. Please contact administrator.",
          } as CustomVerifyOptions);
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
          return done(null, false, {
            message: "Invalid email or password",
          } as CustomVerifyOptions);
        }

        const { requiredRole } = req.body;
        if (requiredRole && user.role !== requiredRole) {
          return done(null, false, {
            message: `Access denied. This portal is for ${requiredRole.replace(
              "_",
              " "
            )}s only. You are a ${user.role.replace("_", " ")}.`,
            actualRole: user.role,
          } as CustomVerifyOptions);
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id)
      .select("-password")
      .populate("companyId", "name email website logo");

    if (!user) {
      return done(null, false);
    }

    if (!user.isActive) {
      return done(null, false);
    }

    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;