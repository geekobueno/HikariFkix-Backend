import { Router } from "express";
import hianimeRoutes from "./hianime.routes.js";
import animesamaRoutes from "./animesama.routes.js";
import hentaiRoutes from "./hentai.routes.js";
import voiranimeRoutes from "./voiranime.routes.js";
import homeController from "../controllers/home.controller.js";
import errorController from "../controllers/error.controller.js";

const router = Router();

// Main routes
router.get("/", homeController.handleHomePage);
router.use("/hianime", hianimeRoutes);
router.use("/hentai", hentaiRoutes);
router.use("/animesama", animesamaRoutes);
router.use("/voiranime", voiranimeRoutes);

// Error routes
router.get("/404", errorController.handle404);
router.use("*", errorController.handle404);

export default router;
