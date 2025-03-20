import express from "express";
import passport from "passport";
import { sessionsController } from "../controllers/sessions.controller.js";

export const sessionsRouter = express.Router();

sessionsRouter.post("/signup", (req, res, next) => {
    passport.authenticate("register", (err, user, info) => {
      if (err) {
        return res.status(500).json({ message: "Error en el servidor." });
      }
      if (!user) {
        return res.status(400).json({ message: info?.message || "No se pudo registrar el usuario." });
      }
      return res.status(201).json({ message: "Registro exitoso", user });
    })(req, res, next);
  });

sessionsRouter.post("/login", passport.authenticate('login', { failureRedirect: '/passportFailure' }), sessionsController.login);

sessionsRouter.get("/logout", sessionsController.logout)