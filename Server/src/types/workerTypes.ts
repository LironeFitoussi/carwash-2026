import type { Document, Model } from "mongoose";

export interface IWorker {
    name: string;
    email?: string;
    phone?: string;
    specialties: string[];
    isActive: boolean;
}

export interface IWorkerDoc extends IWorker, Document {
    createdAt: Date;
    updatedAt: Date;
}

export interface IWorkerModel extends Model<IWorkerDoc> {}
