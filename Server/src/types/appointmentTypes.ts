import type { Document, Model, Types } from "mongoose";

export interface IAppointment {
    clientId: Types.ObjectId;
    workerId: Types.ObjectId;
    serviceType: 'basic' | 'premium' | 'deluxe';
    startTime: Date;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
    isPickedUp: boolean;
    pickupLocation?: string;
    vehicleType?: 'small' | '5-seater' | '7-seater';
}

export interface IAppointmentDoc extends IAppointment, Document {
    createdAt: Date;
    updatedAt: Date;
    conflictsWith(startTime: Date): boolean;
}

export interface IAppointmentModel extends Model<IAppointmentDoc> {}
