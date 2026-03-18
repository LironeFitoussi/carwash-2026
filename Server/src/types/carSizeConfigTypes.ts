import type { Document, Model } from "mongoose";

export type CarSize = 'small' | 'regular' | 'big';

export interface ICarSizeConfig {
    key: CarSize;
    label: { en: string; he: string };
    durationMinutes: number;
    sortOrder: number;
}

export interface ICarSizeConfigDoc extends ICarSizeConfig, Document {
    createdAt: Date;
    updatedAt: Date;
}

export interface ICarSizeConfigModel extends Model<ICarSizeConfigDoc> {}
