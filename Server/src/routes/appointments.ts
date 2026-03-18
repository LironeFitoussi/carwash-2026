import { Router } from "express";
import AppointmentsController from "../controllers/appointmentsController.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { auth0Middleware } from "../middleware/auth0Mdw.js";

const router = Router();
const controller = new AppointmentsController();

router.use(auth0Middleware);

router.get("/next-available", asyncHandler(controller.getNextAvailable.bind(controller)));
router.get("/worker/:workerId", asyncHandler(controller.getAppointmentsByWorker.bind(controller)));
router.get("/client/:clientId", asyncHandler(controller.getAppointmentsByClient.bind(controller)));
router.get("/", asyncHandler(controller.getAppointments.bind(controller)));
router.get("/:id", asyncHandler(controller.getAppointmentById.bind(controller)));
router.post("/", asyncHandler(controller.createAppointment.bind(controller)));
router.post("/:id/switch-status/:status", asyncHandler(controller.switchStatus.bind(controller)));
router.put("/:id", asyncHandler(controller.updateAppointment.bind(controller)));
router.delete("/:id", asyncHandler(controller.deleteAppointment.bind(controller)));

export default router;
