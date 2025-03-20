import passport from "passport";
import local from "passport-local";
import { UserMongoose } from "../DAO/models/mongoose/users.mongoose.js";
import { userService } from "../services/users.service.js";
import { createHash, isValidPassword } from "../utils/Bcrypt.js";
import { logger } from "../utils/logger.js";

const LocalStrategy = local.Strategy;

export function iniPassport() {
  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await UserMongoose.findOne({ email });

          if (!user) {
            logger.info(`User not found: ${email}`);
            return done(null, false, { message: "Usuario no encontrado." });
          }

          if (!isValidPassword(password, user.password)) {
            logger.info(`Invalid password for user: ${email}`);
            return done(null, false, { message: "Contraseña incorrecta." });
          }

          logger.info(`User logged in: ${user.firstName} ${user.lastName} (${user.email})`);
          return done(null, user);
        } catch (err) {
          logger.error("Error in login process:", err);
          return done(err);
        }
      }
    )
  );

  passport.use(
    "register",
  new LocalStrategy(
    {
      passReqToCallback: true,
      usernameField: "email",
    },
    async (req, username, password, done) => {
      try {
        const { firstName, lastName, ci, birth, email, password } = req.body;
        let user = await UserMongoose.findOne({ email: username });

        if (user) {
          logger.info(`User email (${email}) already exists.`);
          return done(null, false, { message: "El email ya está registrado." });
        }

        const newUser = {
          firstName,
          lastName,
          ci,
          birth,
          email,
          password: createHash(password),
        };

        let userCreated = await userService.create(newUser);
        logger.info("User registration successful!");
        return done(null, userCreated);
      } catch (e) {
        logger.error("Error in register: " + e);
        return done(e);
      }
    }
  )
);

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userService.findById(id);
      if (!user) {
        return done(null, false, { message: "Usuario no encontrado en la sesión." });
      }
      done(null, user);
    } catch (err) {
      logger.error("Error in deserializeUser:", err);
      done(err);
    }
  });
}
