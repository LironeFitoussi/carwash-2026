import { Router } from "express";
import ClientsController from "../controllers/clientsController.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { auth0Middleware } from "../middleware/auth0Mdw.js";

const router = Router();
const controller = new ClientsController();

router.use(auth0Middleware);

router.get("/search", asyncHandler(controller.searchClients.bind(controller)));
router.get("/", asyncHandler(controller.getClients.bind(controller)));
router.get("/:id", asyncHandler(controller.getClientById.bind(controller)));
router.post("/", asyncHandler(controller.createClient.bind(controller)));
router.put("/:id", asyncHandler(controller.updateClient.bind(controller)));
router.delete("/:id", asyncHandler(controller.deleteClient.bind(controller)));

export default router;
