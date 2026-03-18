import type { Request, Response } from "express";
import CarSizeConfig from "../models/CarSizeConfig.js";
import { updateCarSizeConfigSchema } from "../zod/carSizeConfigZod.js";
import { AppError } from "../utils/errorHandler.js";
import { clearDurationCache } from "../utils/carSizeDuration.js";

class CarSizeConfigController {
    async getAll(_req: Request, res: Response) {
        const configs = await CarSizeConfig.find().sort({ sortOrder: 1 });
        res.status(200).json({ success: true, data: configs });
    }

    async updateByKey(req: Request, res: Response) {
        const key = req.params.key!;
        const validKeys = ['small', 'regular', 'big'];
        if (!validKeys.includes(key)) {
            throw new AppError('Invalid car size key', 400);
        }

        const data = updateCarSizeConfigSchema.parse(req.body);
        const config = await CarSizeConfig.findOneAndUpdate(
            { key },
            data,
            { new: true, runValidators: true }
        );
        if (!config) throw new AppError('Car size config not found', 404);

        clearDurationCache();
        res.status(200).json({ success: true, data: config });
    }
}

export default CarSizeConfigController;
