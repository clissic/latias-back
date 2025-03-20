import { logger } from "../utils/logger.js";

class SessionsController {
  async signup(req, res) {
    try {
      if (!req.user) {
        return res.status(400).send({ msg: "Something went wrong." });
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

      return res.status(201).json({ msg: "User signed up successfully." });
    } catch (err) {
      logger.error("Signup error:", err);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  }

  async login(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ msg: "User email or password are incorrect." });
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

      return res.status(200).json({ msg: "Login successful." });
    } catch (err) {
      logger.error("Login error:", err);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  }

  logout(req, res) {
    if (!req.session.user) {
      return res.status(400).json({ msg: "No active session found." });
    }

    const { status, firstName, lastName } = req.session.user; // Guardar datos antes de destruir sesión

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ msg: "Logout error." });
      }
      logger.info(`${status} ${firstName} ${lastName} logged out`);
      res.status(200).json({ msg: "Logout successful." });
    });
  }
}

export const sessionsController = new SessionsController();
