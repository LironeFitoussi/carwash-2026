import { Router } from "express";
import CarSizeConfigController from "../controllers/carSizeConfigController.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { auth0Middleware } from "../middleware/auth0Mdw.js";

const router = Router();
const controller = new CarSizeConfigController();

router.get("/", asyncHandler(controller.getAll.bind(controller)));
router.put("/:key", auth0Middleware, asyncHandler(controller.updateByKey.bind(controller)));

export default router;
