import { Router } from "express";
import WorkersController from "../controllers/workersController.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { auth0Middleware } from "../middleware/auth0Mdw.js";

const router = Router();
const controller = new WorkersController();

router.use(auth0Middleware);

router.get("/name/:name", asyncHandler(controller.getWorkerByName.bind(controller)));
router.get("/:workerId/availability", asyncHandler(controller.getWorkerAvailability.bind(controller)));
router.get("/", asyncHandler(controller.getWorkers.bind(controller)));
router.get("/:id", asyncHandler(controller.getWorkerById.bind(controller)));
router.post("/", asyncHandler(controller.createWorker.bind(controller)));
router.put("/:id", asyncHandler(controller.updateWorker.bind(controller)));
router.delete("/:id", asyncHandler(controller.deleteWorker.bind(controller)));

export default router;
