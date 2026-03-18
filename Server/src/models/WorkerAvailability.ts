import mongoose, { Schema } from "mongoose";
import type { IWorkerAvailabilityDoc, IWorkerAvailabilityModel } from "../types/index";

const workerAvailabilitySchema = new Schema<IWorkerAvailabilityDoc>({
    workerId: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Unique: one entry per worker per date
workerAvailabilitySchema.index({ workerId: 1, date: 1 }, { unique: true });

const WorkerAvailabilityModel = mongoose.model<IWorkerAvailabilityDoc, IWorkerAvailabilityModel>(
    'WorkerAvailability',
    workerAvailabilitySchema
);

export default WorkerAvailabilityModel;
