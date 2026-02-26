import express from "express";
import { instructorsController } from "../controllers/instructors.controller.js";
import { authenticateToken, authorizeByCategory } from "../middleware/auth.middleware.js";

export const instructorsRouter = express.Router();

instructorsRouter.get("/", instructorsController.getAll);
instructorsRouter.get("/id/:id", instructorsController.findById);
instructorsRouter.get("/ci/:ci", instructorsController.findByCi);
instructorsRouter.get("/course/:courseId", instructorsController.findByCourseId);

instructorsRouter.post("/create", authenticateToken, authorizeByCategory(["Administrador"]), instructorsController.create);
instructorsRouter.put("/update/:id", authenticateToken, authorizeByCategory(["Administrador"]), instructorsController.updateOne);
instructorsRouter.delete("/delete/:id", authenticateToken, authorizeByCategory(["Administrador"]), instructorsController.deleteOne);
