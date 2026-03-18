import mongoose, { Schema } from "mongoose";
import type { IClientDoc, IClientModel } from "../types/index";

const clientSchema = new Schema<IClientDoc>({
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    notes: { type: String },
    carType: {
        type: String,
        enum: ['small', 'medium', 'large', 'motorcycle'],
        required: true,
    },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

const ClientModel = mongoose.model<IClientDoc, IClientModel>('Client', clientSchema);

export default ClientModel;
