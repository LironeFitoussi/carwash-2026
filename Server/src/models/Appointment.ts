import mongoose, { Schema } from "mongoose";
import type { IAppointmentDoc, IAppointmentModel } from "../types/index";

const appointmentSchema = new Schema<IAppointmentDoc>({
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
    serviceType: {
        type: String,
        enum: ['basic', 'premium', 'deluxe'],
        required: true,
    },
    startTime: { type: Date, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending',
    },
    notes: { type: String },
    isPickedUp: { type: Boolean, default: false },
    pickupLocation: { type: String },
    vehicleType: {
        type: String,
        enum: ['small', '5-seater', '7-seater'],
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

appointmentSchema.methods.conflictsWith = function (startTime: Date): boolean {
    const duration = 59 * 60 * 1000;
    return Math.abs(this.startTime.getTime() - startTime.getTime()) < duration;
};

const AppointmentModel = mongoose.model<IAppointmentDoc, IAppointmentModel>('Appointment', appointmentSchema);

export default AppointmentModel;
