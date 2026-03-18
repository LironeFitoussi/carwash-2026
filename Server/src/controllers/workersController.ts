import type { Request, Response } from "express";
import Worker from "../models/Worker.js";
import Appointment from "../models/Appointment.js";
import WorkerAvailability from "../models/WorkerAvailability.js";
import { createWorkerSchema, updateWorkerSchema, assignAvailabilitySchema, deleteAvailabilitySchema } from "../zod/workersZod.js";
import { AppError } from "../utils/errorHandler.js";
import { getDurationMinutes } from "../utils/carSizeDuration.js";
import type { CarSize } from "../types/index";

function parseTime(timeStr: string): { hours: number; minutes: number } {
    const parts = timeStr.split(':');
    return { hours: Number(parts[0]), minutes: Number(parts[1]) };
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

    // --- Availability management ---

    async assignAvailability(req: Request, res: Response) {
        const data = assignAvailabilitySchema.parse(req.body);

        const worker = await Worker.findById(data.workerId);
        if (!worker) throw new AppError('Worker not found', 404);

        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        if (start > end) throw new AppError('startDate must be before endDate', 400);

        const ops = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateKey = new Date(d);
            dateKey.setUTCHours(0, 0, 0, 0);
            ops.push({
                updateOne: {
                    filter: { workerId: data.workerId, date: dateKey },
                    update: {
                        $set: {
                            startTime: data.startTime,
                            endTime: data.endTime,
                        },
                    },
                    upsert: true,
                },
            });
        }

        await WorkerAvailability.bulkWrite(ops);
        res.status(200).json({
            success: true,
            message: `Assigned ${ops.length} days for ${worker.name}`,
            data: { count: ops.length },
        });
    }

    async getAvailabilityDates(req: Request, res: Response) {
        const { workerId } = req.params;
        const { month, year } = req.query;

        const worker = await Worker.findById(workerId);
        if (!worker) throw new AppError('Worker not found', 404);

        let filter: any = { workerId };

        // If month/year provided, filter to that month
        if (month && year) {
            const m = Number(month);
            const y = Number(year);
            const start = new Date(Date.UTC(y, m - 1, 1));
            const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
            filter.date = { $gte: start, $lte: end };
        }

        const dates = await WorkerAvailability.find(filter).sort({ date: 1 });
        res.status(200).json({ success: true, data: dates });
    }

    async deleteAvailability(req: Request, res: Response) {
        const data = deleteAvailabilitySchema.parse(req.body);

        const dateDocs = data.dates.map(d => {
            const date = new Date(d);
            date.setUTCHours(0, 0, 0, 0);
            return date;
        });

        const result = await WorkerAvailability.deleteMany({
            workerId: data.workerId,
            date: { $in: dateDocs },
        });

        res.status(200).json({
            success: true,
            message: `Removed ${result.deletedCount} availability dates`,
            data: { deletedCount: result.deletedCount },
        });
    }

    // --- Slot availability for booking ---

    async getWorkerAvailability(req: Request, res: Response) {
        const { workerId } = req.params;
        const { date, carSize } = req.query;

        if (!date || typeof date !== 'string') {
            throw new AppError('date query parameter is required', 400);
        }

        const worker = await Worker.findById(workerId);
        if (!worker) throw new AppError('Worker not found', 404);

        const effectiveCarSize = (carSize && typeof carSize === 'string' ? carSize : 'regular') as CarSize;
        const validSizes = ['small', 'regular', 'big'];
        if (!validSizes.includes(effectiveCarSize)) {
            throw new AppError('Invalid carSize. Must be: small, regular, or big', 400);
        }

        const durationMinutes = await getDurationMinutes(effectiveCarSize);
        const durationMs = durationMinutes * 60_000;

        const dayStart = new Date(date);
        dayStart.setUTCHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setUTCHours(23, 59, 59, 999);

        // Check if worker has availability on this date
        const availability = await WorkerAvailability.findOne({
            workerId,
            date: dayStart,
        });

        if (!availability) {
            res.status(200).json({
                success: true,
                data: {
                    workerId,
                    date: dayStart.toISOString(),
                    carSize: effectiveCarSize,
                    durationMinutes,
                    isAvailable: false,
                    availableSlots: [],
                    bookedSlots: [],
                    appointments: [],
                },
            });
            return;
        }

        const appointments = await Appointment.find({
            workerId,
            status: { $nin: ['cancelled'] },
            startTime: { $gte: dayStart, $lte: dayEnd },
        }).sort({ startTime: 1 });

        const openParsed = parseTime(availability.startTime);
        const closeParsed = parseTime(availability.endTime);

        const openTime = new Date(dayStart);
        openTime.setUTCHours(openParsed.hours, openParsed.minutes, 0, 0);

        const closeTime = new Date(dayStart);
        closeTime.setUTCHours(closeParsed.hours, closeParsed.minutes, 0, 0);
        const latestStart = new Date(closeTime.getTime() - durationMs);

        const availableSlots: { start: string; end: string }[] = [];
        const bookedSlots: { start: string; end: string }[] = [];

        for (const apt of appointments) {
            bookedSlots.push({
                start: apt.startTime.toISOString(),
                end: new Date(apt.startTime.getTime() + apt.durationMinutes * 60_000).toISOString(),
            });
        }

        for (
            let candidate = new Date(openTime);
            candidate <= latestStart;
            candidate = new Date(candidate.getTime() + 15 * 60_000)
        ) {
            const candidateEnd = candidate.getTime() + durationMs;
            const hasConflict = appointments.some(apt => {
                const aptEnd = apt.startTime.getTime() + apt.durationMinutes * 60_000;
                return candidate.getTime() < aptEnd && apt.startTime.getTime() < candidateEnd;
            });

            if (!hasConflict) {
                availableSlots.push({
                    start: candidate.toISOString(),
                    end: new Date(candidateEnd).toISOString(),
                });
            }
        }

        res.status(200).json({
            success: true,
            data: {
                workerId,
                date: dayStart.toISOString(),
                carSize: effectiveCarSize,
                durationMinutes,
                isAvailable: true,
                schedule: { startTime: availability.startTime, endTime: availability.endTime },
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
        // Also clean up availability dates
        await WorkerAvailability.deleteMany({ workerId: worker._id });
        res.status(200).json({ success: true, message: 'Worker deleted successfully' });
    }
}

export default WorkersController;
