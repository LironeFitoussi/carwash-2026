import mongoose, { Schema } from "mongoose";
import type { IWorkerDoc, IWorkerModel } from "../types/index";

const workerSchema = new Schema<IWorkerDoc>({
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    specialties: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

const WorkerModel = mongoose.model<IWorkerDoc, IWorkerModel>('Worker', workerSchema);

export default WorkerModel;
