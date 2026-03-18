import type { Request, Response } from "express";
import Client from "../models/Client.js";
import { createClientSchema, updateClientSchema } from "../zod/clientsZod.js";
import { AppError } from "../utils/errorHandler.js";

class ClientsController {
    async createClient(req: Request, res: Response) {
        const data = createClientSchema.parse(req.body);
        const client = await Client.create(data);
        res.status(201).json({ success: true, data: client });
    }

    async getClients(_req: Request, res: Response) {
        const clients = await Client.find();
        res.status(200).json({ success: true, data: clients });
    }

    async searchClients(req: Request, res: Response) {
        const { name } = req.query;
        if (!name || typeof name !== 'string') {
            throw new AppError('name query parameter is required', 400);
        }
        const clients = await Client.find({
            name: { $regex: name, $options: 'i' },
        }).select('_id name').limit(10);
        res.status(200).json({ success: true, data: clients });
    }

    async getClientById(req: Request, res: Response) {
        const client = await Client.findById(req.params.id);
        if (!client) throw new AppError('Client not found', 404);
        res.status(200).json({ success: true, data: client });
    }

    async updateClient(req: Request, res: Response) {
        const data = updateClientSchema.parse(req.body);
        const client = await Client.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
        if (!client) throw new AppError('Client not found', 404);
        res.status(200).json({ success: true, data: client });
    }

    async deleteClient(req: Request, res: Response) {
        const client = await Client.findByIdAndDelete(req.params.id);
        if (!client) throw new AppError('Client not found', 404);
        res.status(200).json({ success: true, message: 'Client deleted successfully' });
    }
}

export default ClientsController;
