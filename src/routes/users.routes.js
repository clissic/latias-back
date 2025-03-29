import express from "express";
import { usersController } from "../controllers/users.controller.js";

export const usersRouter = express.Router();

usersRouter.get("/", usersController.getAll);

usersRouter.post("/create", usersController.create);

usersRouter.get("/findByEmail", usersController.findByEmail);