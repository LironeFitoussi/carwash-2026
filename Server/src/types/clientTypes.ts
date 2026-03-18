import type { Document, Model } from "mongoose";

export interface IClient {
    name: string;
    email?: string;
    phone?: string;
    notes?: string;
    carType: 'small' | 'medium' | 'large' | 'motorcycle';
    isActive: boolean;
}

export interface IClientDoc extends IClient, Document {
    createdAt: Date;
    updatedAt: Date;
}

export interface IClientModel extends Model<IClientDoc> {}
