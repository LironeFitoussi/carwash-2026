import type { Request, Response } from "express";
import Appointment from "../models/Appointment.js";
import Worker from "../models/Worker.js";
import WorkerAvailability from "../models/WorkerAvailability.js";
import { createAppointmentSchema, updateAppointmentSchema } from "../zod/appointmentsZod.js";
import { AppError } from "../utils/errorHandler.js";
import { getDurationMinutes } from "../utils/carSizeDuration.js";
import { israelTimeToUTC, isSameIsraelDay, getIsraelHoursMinutes } from "../utils/timezone.js";
import type { CarSize } from "../types/index";

function parseTime(timeStr: string): { hours: number; minutes: number } {
    const parts = timeStr.split(':');
    return { hours: Number(parts[0]), minutes: Number(parts[1]) };
}

function checkHours(startTime: Date, durationMinutes: number, scheduleStart: string, scheduleEnd: string): boolean {
    // Convert startTime to Israel hours/minutes for comparison with schedule (which is in Israel time)
    const israelTime = getIsraelHoursMinutes(startTime);
    const startTotal = israelTime.hours * 60 + israelTime.minutes;
    const endTotal = startTotal + durationMinutes;
    const openParsed = parseTime(scheduleStart);
    const closeParsed = parseTime(scheduleEnd);
    const openMinutes = openParsed.hours * 60 + openParsed.minutes;
    const closeMinutes = closeParsed.hours * 60 + closeParsed.minutes;
    return startTotal >= openMinutes && endTotal <= closeMinutes;
}

async function getAvailabilityForDate(workerId: string, date: Date) {
    const dayStart = new Date(date);
    dayStart.setUTCHours(0, 0, 0, 0);
    return WorkerAvailability.findOne({ workerId, date: dayStart });
}

const POPULATE_OPTIONS = [
    { path: 'clientId', select: 'name email phone carType' },
    { path: 'workerId', select: 'name email' },
];

function findOverlappingQuery(workerId: string, startTime: Date, durationMinutes: number, excludeId?: string) {
    const newEndTime = new Date(startTime.getTime() + durationMinutes * 60_000);
    const filter: any = {
        workerId,
        status: { $nin: ['cancelled'] },
        $expr: {
            $and: [
                { $lt: ['$startTime', newEndTime] },
                { $lt: [startTime, { $add: ['$startTime', { $multiply: ['$durationMinutes', 60000] }] }] },
            ],
        },
    };
    if (excludeId) {
        filter._id = { $ne: excludeId };
    }
    return Appointment.find(filter);
}

class AppointmentsController {
    async createAppointment(req: Request, res: Response) {
        const data = createAppointmentSchema.parse(req.body);
        const startTime = new Date(data.startTime);
        const durationMinutes = await getDurationMinutes(data.vehicleType as CarSize);

        const worker = await Worker.findById(data.workerId);
        if (!worker) throw new AppError('Worker not found', 404);

        const availability = await getAvailabilityForDate(data.workerId, startTime);
        if (!availability) {
            throw new AppError('Worker is not available on this date', 400);
        }

        if (!checkHours(startTime, durationMinutes, availability.startTime, availability.endTime)) {
            throw new AppError(`Appointment must fit within worker's hours (${availability.startTime} - ${availability.endTime}). Duration: ${durationMinutes} minutes`, 400);
        }

        const conflicts = await findOverlappingQuery(data.workerId, startTime, durationMinutes);

        if (conflicts.length > 0) {
            res.status(409).json({
                success: false,
                message: 'Worker is unavailable at this time',
                conflicts,
            });
            return;
        }

        const appointment = await Appointment.create({ ...data, startTime, durationMinutes });
        const populated = await appointment.populate(POPULATE_OPTIONS);
        res.status(201).json({ success: true, data: populated });
    }

    async getAppointments(_req: Request, res: Response) {
        const appointments = await Appointment.find().populate(POPULATE_OPTIONS);
        res.status(200).json({ success: true, data: appointments });
    }

    async getAppointmentById(req: Request, res: Response) {
        const appointment = await Appointment.findById(req.params.id).populate(POPULATE_OPTIONS);
        if (!appointment) throw new AppError('Appointment not found', 404);
        res.status(200).json({ success: true, data: appointment });
    }

    async getAppointmentsByWorker(req: Request, res: Response) {
        const appointments = await Appointment.find({ workerId: req.params.workerId })
            .sort({ startTime: 1 })
            .populate(POPULATE_OPTIONS);
        res.status(200).json({ success: true, data: appointments });
    }

    async getAppointmentsByClient(req: Request, res: Response) {
        const appointments = await Appointment.find({ clientId: req.params.clientId })
            .sort({ startTime: 1 })
            .populate(POPULATE_OPTIONS);
        res.status(200).json({ success: true, data: appointments });
    }

    async switchStatus(req: Request, res: Response) {
        const id = req.params.id!;
        const status = req.params.status!;
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new AppError('Invalid status', 400);
        }
        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        ).populate(POPULATE_OPTIONS);
        if (!appointment) throw new AppError('Appointment not found', 404);
        res.status(200).json({ success: true, data: appointment });
    }

    async updateAppointment(req: Request, res: Response) {
        const data = updateAppointmentSchema.parse(req.body);
        const startTime = data.startTime ? new Date(data.startTime) : undefined;

        let durationMinutes: number | undefined;
        if (data.vehicleType) {
            durationMinutes = await getDurationMinutes(data.vehicleType as CarSize);
        }

        if (startTime) {
            const workerId = data.workerId;
            const effectiveDuration = durationMinutes;

            if (workerId && effectiveDuration) {
                const availability = await getAvailabilityForDate(workerId, startTime);
                if (!availability) {
                    throw new AppError('Worker is not available on this date', 400);
                }
                if (!checkHours(startTime, effectiveDuration, availability.startTime, availability.endTime)) {
                    throw new AppError(`Appointment must fit within worker's hours (${availability.startTime} - ${availability.endTime}). Duration: ${effectiveDuration} minutes`, 400);
                }

                const conflicts = await findOverlappingQuery(workerId, startTime, effectiveDuration, req.params.id);

                if (conflicts.length > 0) {
                    res.status(409).json({
                        success: false,
                        message: 'Worker is unavailable at this time',
                        conflicts,
                    });
                    return;
                }
            }
        }

        const updateData: any = { ...data };
        if (startTime) updateData.startTime = startTime;
        if (durationMinutes) updateData.durationMinutes = durationMinutes;

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate(POPULATE_OPTIONS);
        if (!appointment) throw new AppError('Appointment not found', 404);
        res.status(200).json({ success: true, data: appointment });
    }

    async deleteAppointment(req: Request, res: Response) {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!appointment) throw new AppError('Appointment not found', 404);
        res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
    }

    async checkDuplicate(req: Request, res: Response) {
        const { clientId } = req.query;
        if (!clientId || typeof clientId !== 'string') {
            throw new AppError('clientId query parameter is required', 400);
        }

        const activeAppointments = await Appointment.find({
            clientId,
            status: { $in: ['pending', 'confirmed'] },
        })
            .sort({ startTime: 1 })
            .populate(POPULATE_OPTIONS);

        res.status(200).json({
            success: true,
            data: {
                hasActiveAppointments: activeAppointments.length > 0,
                appointments: activeAppointments,
            },
        });
    }

    async getNextAvailable(req: Request, res: Response) {
        const { workerId, carSize } = req.query;

        if (!workerId || typeof workerId !== 'string') {
            throw new AppError('workerId query parameter is required', 400);
        }
        if (!carSize || typeof carSize !== 'string') {
            throw new AppError('carSize query parameter is required', 400);
        }

        const validSizes = ['small', 'regular', 'big'];
        if (!validSizes.includes(carSize)) {
            throw new AppError('Invalid carSize. Must be: small, regular, or big', 400);
        }

        const worker = await Worker.findById(workerId);
        if (!worker) throw new AppError('Worker not found', 404);

        const durationMinutes = await getDurationMinutes(carSize as CarSize);
        const durationMs = durationMinutes * 60_000;

        const now = new Date();
        const scanDays = 30;

        // Get all availability dates for this worker in the next N days
        const scanStart = new Date(now);
        scanStart.setUTCHours(0, 0, 0, 0);
        const scanEnd = new Date(now);
        scanEnd.setDate(scanEnd.getDate() + scanDays);
        scanEnd.setUTCHours(23, 59, 59, 999);

        const availabilityDates = await WorkerAvailability.find({
            workerId,
            date: { $gte: scanStart, $lte: scanEnd },
        }).sort({ date: 1 });

        if (availabilityDates.length === 0) {
            throw new AppError(`Worker has no available dates in the next ${scanDays} days`, 404);
        }

        // Fetch all non-cancelled appointments in the window
        const appointments = await Appointment.find({
            workerId,
            status: { $nin: ['cancelled'] },
            startTime: { $gte: scanStart, $lte: scanEnd },
        }).sort({ startTime: 1 });

        // Scan each available date
        for (const avail of availabilityDates) {
            // Convert Israel local HH:mm to UTC Date objects
            const openTime = israelTimeToUTC(avail.date, avail.startTime);
            const closeTime = israelTimeToUTC(avail.date, avail.endTime);
            const latestStart = new Date(closeTime.getTime() - durationMs);

            // If this is today (in Israel timezone), start from now
            const isToday = isSameIsraelDay(avail.date, now);
            let startFrom = isToday ? new Date(Math.max(now.getTime(), openTime.getTime())) : openTime;

            // Round up to next 15-minute increment
            const totalMins = startFrom.getUTCHours() * 60 + startFrom.getUTCMinutes();
            const roundedMins = Math.ceil(totalMins / 15) * 15;
            startFrom = new Date(startFrom);
            startFrom.setUTCHours(Math.floor(roundedMins / 60), roundedMins % 60, 0, 0);

            for (
                let candidate = new Date(startFrom);
                candidate <= latestStart;
                candidate = new Date(candidate.getTime() + 15 * 60_000)
            ) {
                const candidateEnd = candidate.getTime() + durationMs;

                const hasConflict = appointments.some(apt => {
                    const aptEnd = apt.startTime.getTime() + apt.durationMinutes * 60_000;
                    return candidate.getTime() < aptEnd && apt.startTime.getTime() < candidateEnd;
                });

                if (!hasConflict) {
                    res.status(200).json({
                        success: true,
                        data: {
                            suggestedTime: candidate.toISOString(),
                            durationMinutes,
                        },
                    });
                    return;
                }
            }
        }

        throw new AppError(`No available slots found in the next ${scanDays} days`, 404);
    }
}

export default AppointmentsController;
