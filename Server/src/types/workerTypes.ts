import type { Document, Model, Types } from "mongoose";

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

// A single available date for a worker
export interface IWorkerAvailability {
    workerId: Types.ObjectId;
    date: Date;       // The calendar date (time portion zeroed out)
    startTime: string; // "HH:mm" in UTC, e.g. "08:30"
    endTime: string;   // "HH:mm" in UTC, e.g. "17:00"
}

export interface IWorkerAvailabilityDoc extends IWorkerAvailability, Document {
    createdAt: Date;
    updatedAt: Date;
}

export interface IWorkerAvailabilityModel extends Model<IWorkerAvailabilityDoc> {}
