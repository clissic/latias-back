import express from "express";
import passport from "passport";
import { sessionsController } from "../controllers/sessions.controller.js";

export const sessionsRouter = express.Router();

sessionsRouter.post("/signup", passport.authenticate("register", { session: false }), sessionsController.signup);

sessionsRouter.post("/login", sessionsController.login);

sessionsRouter.post("/logout", sessionsController.logout);