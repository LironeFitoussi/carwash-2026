import type { Document, Model, Types } from "mongoose";
import type { CarSize } from "./carSizeConfigTypes";

export interface IAppointment {
    clientId: Types.ObjectId;
    workerId: Types.ObjectId;
    serviceType: 'basic' | 'premium' | 'deluxe';
    startTime: Date;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
    isPickedUp: boolean;
    pickupLocation?: string;
    vehicleType: CarSize;
    durationMinutes: number;
}

export interface IAppointmentDoc extends IAppointment, Document {
    createdAt: Date;
    updatedAt: Date;
    conflictsWith(startTime: Date, durationMinutes: number): boolean;
}

export interface IAppointmentModel extends Model<IAppointmentDoc> {}
