import mongoose, { Schema } from "mongoose";
import type { ICarSizeConfigDoc, ICarSizeConfigModel } from "../types/index";

const carSizeConfigSchema = new Schema<ICarSizeConfigDoc>({
    key: {
        type: String,
        enum: ['small', 'regular', 'big'],
        required: true,
        unique: true,
    },
    label: {
        en: { type: String, required: true },
        he: { type: String, required: true },
    },
    durationMinutes: { type: Number, required: true },
    sortOrder: { type: Number, required: true },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

const CarSizeConfigModel = mongoose.model<ICarSizeConfigDoc, ICarSizeConfigModel>('CarSizeConfig', carSizeConfigSchema);

export default CarSizeConfigModel;

export const CAR_SIZE_DEFAULTS = [
    { key: 'small', label: { en: 'Small', he: 'קטן' }, durationMinutes: 60, sortOrder: 1 },
    { key: 'regular', label: { en: 'Regular', he: 'רגיל' }, durationMinutes: 90, sortOrder: 2 },
    { key: 'big', label: { en: 'Big', he: 'גדול' }, durationMinutes: 105, sortOrder: 3 },
] as const;

export async function seedCarSizeConfigs(): Promise<void> {
    const count = await CarSizeConfigModel.countDocuments();
    if (count === 0) {
        await CarSizeConfigModel.insertMany(CAR_SIZE_DEFAULTS);
        console.log('Seeded car size configs');
    }
}
