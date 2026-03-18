import type { Request, Response } from "express";
import Worker from "../models/Worker.js";
import Appointment from "../models/Appointment.js";
import { createWorkerSchema, updateWorkerSchema } from "../zod/workersZod.js";
import { AppError } from "../utils/errorHandler.js";

function generateTimeSlots(date: Date): { start: Date; end: Date }[] {
    const slots: { start: Date; end: Date }[] = [];
    const startHour = 8;
    const startMinute = 30;
    const endHour = 20;
    const endMinute = 30;

    for (let h = startHour; h <= endHour; h++) {
        for (let m = h === startHour ? startMinute : 0; m < 60; m += 60) {
            if (h === endHour && m >= endMinute) break;
            const start = new Date(date);
            start.setHours(h, m, 0, 0);
            const end = new Date(start);
            end.setHours(h + 1, m, 0, 0);
            slots.push({ start, end });
        }
    }
    return slots;
}

class WorkersController {
    async createWorker(req: Request, res: Response) {
        const data = createWorkerSchema.parse(req.body);
        const worker = await Worker.create(data);
        res.status(201).json({ success: true, data: worker });
    }

    async getWorkers(_req: Request, res: Response) {
        const workers = await Worker.find();
        res.status(200).json({ success: true, data: workers });
    }

    async getWorkerById(req: Request, res: Response) {
        const worker = await Worker.findById(req.params.id);
        if (!worker) throw new AppError('Worker not found', 404);
        res.status(200).json({ success: true, data: worker });
    }

    async getWorkerByName(req: Request, res: Response) {
        const worker = await Worker.findOne({
            name: { $regex: req.params.name, $options: 'i' },
        });
        if (!worker) throw new AppError('Worker not found', 404);
        res.status(200).json({ success: true, data: worker });
    }

    async getWorkerAvailability(req: Request, res: Response) {
        const { workerId } = req.params;
        const { date } = req.query;

        if (!date || typeof date !== 'string') {
            throw new AppError('date query parameter is required', 400);
        }

        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            workerId,
            status: { $nin: ['cancelled'] },
            startTime: { $gte: dayStart, $lte: dayEnd },
        });

        const allSlots = generateTimeSlots(dayStart);
        const bookedSlots = appointments.map(a => ({
            start: a.startTime,
            end: new Date(a.startTime.getTime() + 59 * 60 * 1000),
        }));

        const availableSlots = allSlots.filter(slot =>
            !appointments.some(a => {
                const diff = Math.abs(a.startTime.getTime() - slot.start.getTime());
                return diff < 59 * 60 * 1000;
            })
        );

        res.status(200).json({
            success: true,
            data: {
                workerId,
                date: dayStart.toISOString(),
                availableSlots,
                bookedSlots,
                appointments,
            },
        });
    }

    async updateWorker(req: Request, res: Response) {
        const data = updateWorkerSchema.parse(req.body);
        const worker = await Worker.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
        if (!worker) throw new AppError('Worker not found', 404);
        res.status(200).json({ success: true, data: worker });
    }

    async deleteWorker(req: Request, res: Response) {
        const worker = await Worker.findByIdAndDelete(req.params.id);
        if (!worker) throw new AppError('Worker not found', 404);
        res.status(200).json({ success: true, message: 'Worker deleted successfully' });
    }
}

export default WorkersController;
