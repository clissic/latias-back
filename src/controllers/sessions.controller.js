import { logger } from "../utils/logger.js";
import passport from "passport";
import { differenceInMinutes } from "date-fns";
import { UserMongoose } from "../DAO/models/mongoose/users.mongoose.js";

class SessionsController {
  async signup(req, res) {
    try {
      if (!req.user) {
        return res.status(400).send({ msg: "El usuario no se registro correctamente" });
      }

      req.session.user = {
        _id: req.user._id,
        email: req.user.email,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        birth: req.user.birth,
        phone: req.user.phone,
        rank: req.user.rank,
        status: req.user.role,
        ci: req.user.ci,
        address: req.user.address,
        preferences: req.user.preferences,
        statistics: req.user.statistics,
        settings: req.user.settings,
        purchasedCourses: req.user.purchasedCourses,
        finishedCourses: req.user.finishedCourses,
      };

      return res.status(201).json({ msg: "Registro exitoso" });
    } catch (err) {
      logger.error("Signup error:", err);
      return res.status(500).json({ msg: "Internal Server Error!" });
    }
  }

  async login(req, res, next) {
    passport.authenticate("login", (err, user, info) => {
      if (err) return next(err);

      if (!user) {
        return res.status(401).json({ msg: info?.message || "Credenciales inválidas" });
      }

      req.login(user, async (err) => {
        if (err) return next(err);

        user.lastLogin = new Date();
        await user.save();

        req.session.user = {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          birth: user.birth,
          phone: user.phone,
          rank: user.rank,
          status: user.status,
          ci: user.ci,
          address: user.address,
          preferences: user.preferences,
          statistics: user.statistics,
          settings: user.settings,
          purchasedCourses: user.purchasedCourses,
          finishedCourses: user.finishedCourses,
        };

        return res.status(200).json({ msg: "Login exitoso", user: req.session.user });
      });
    })(req, res, next);
  }

  async logout(req, res) {
    if (!req.session.user) {
      return res.status(400).json({ msg: "No active session found." });
    }

  try {
    const userId = req.session.user._id;
    const user = await UserMongoose.findById(userId);

      if (user && user.lastLogin) {
        const minutos = differenceInMinutes(new Date(), user.lastLogin);
        console.log(minutos)
        user.statistics.timeConnected += minutos;
        user.lastLogin = null;
        await user.save();
      }

      const { status, firstName, lastName, email } = req.session.user;

      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ msg: "Logout error." });
        }
        logger.info(`${status} ${firstName} ${lastName} (${email}) logged out`);
        res.status(200).json({ msg: "Logout successful." });
      });
    } catch (err) {
      logger.error("Logout error:", err);
      res.status(500).json({ msg: "Error al cerrar sesión" });
    }
  }
}

export const sessionsController = new SessionsController();
