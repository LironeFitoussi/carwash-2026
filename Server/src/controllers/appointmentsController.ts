import type { Request, Response } from "express";
import Appointment from "../models/Appointment.js";
import Worker from "../models/Worker.js";
import { createAppointmentSchema, updateAppointmentSchema } from "../zod/appointmentsZod.js";
import { AppError } from "../utils/errorHandler.js";

const POPULATE_OPTIONS = [
    { path: 'clientId', select: 'name email phone' },
    { path: 'workerId', select: 'name email' },
];

function checkBusinessHours(startTime: Date): boolean {
    const hours = startTime.getUTCHours();
    const minutes = startTime.getUTCMinutes();
    const totalMinutes = hours * 60 + minutes;
    const openMinutes = 5 * 60 + 30;  // 05:30
    const closeMinutes = 18 * 60 + 30; // 18:30
    return totalMinutes >= openMinutes && totalMinutes <= closeMinutes;
}

class AppointmentsController {
    async createAppointment(req: Request, res: Response) {
        const data = createAppointmentSchema.parse(req.body);
        const startTime = new Date(data.startTime);

        const worker = await Worker.findById(data.workerId);
        if (!worker) throw new AppError('Worker not found', 404);

        if (!checkBusinessHours(startTime)) {
            throw new AppError('Appointment must be between 05:30 and 18:30', 400);
        }

        const conflicts = await Appointment.find({
            workerId: data.workerId,
            status: { $nin: ['cancelled'] },
            startTime: {
                $gte: new Date(startTime.getTime() - 59 * 60 * 1000),
                $lte: new Date(startTime.getTime() + 59 * 60 * 1000),
            },
        });

        if (conflicts.length > 0) {
            res.status(409).json({
                success: false,
                message: 'Worker is unavailable at this time',
                conflicts,
            });
            return;
        }

        const appointment = await Appointment.create({ ...data, startTime });
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
        const { id, status } = req.params;
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

        if (startTime) {
            const workerId = data.workerId;

            if (!checkBusinessHours(startTime)) {
                throw new AppError('Appointment must be between 05:30 and 18:30', 400);
            }

            if (workerId) {
                const conflicts = await Appointment.find({
                    workerId,
                    status: { $nin: ['cancelled'] },
                    _id: { $ne: req.params.id },
                    startTime: {
                        $gte: new Date(startTime.getTime() - 59 * 60 * 1000),
                        $lte: new Date(startTime.getTime() + 59 * 60 * 1000),
                    },
                });

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

        const updateData = startTime ? { ...data, startTime } : data;
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
}

export default AppointmentsController;
