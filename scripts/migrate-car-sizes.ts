/**
 * Migration script: Car Size + Duration system
 *
 * Run with: npx tsx scripts/migrate-car-sizes.ts
 *
 * This script:
 * 1. Seeds the CarSizeConfig collection with defaults
 * 2. Migrates existing appointments: vehicleType enum + adds durationMinutes
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../Server/.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('MONGO_URI not set');
    process.exit(1);
}

async function migrate() {
    await mongoose.connect(MONGO_URI!);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db!;

    // 1. Seed CarSizeConfig
    const configCollection = db.collection('carsizeconfigs');
    const existingConfigs = await configCollection.countDocuments();
    if (existingConfigs === 0) {
        await configCollection.insertMany([
            { key: 'small', label: { en: 'Small', he: 'קטן' }, durationMinutes: 60, sortOrder: 1, createdAt: new Date(), updatedAt: new Date() },
            { key: 'regular', label: { en: 'Regular', he: 'רגיל' }, durationMinutes: 90, sortOrder: 2, createdAt: new Date(), updatedAt: new Date() },
            { key: 'big', label: { en: 'Big', he: 'גדול' }, durationMinutes: 105, sortOrder: 3, createdAt: new Date(), updatedAt: new Date() },
        ]);
        console.log('Seeded 3 car size configs');
    } else {
        console.log(`CarSizeConfig already has ${existingConfigs} documents, skipping seed`);
    }

    // 2. Migrate existing appointments
    const appointments = db.collection('appointments');

    // Map old vehicleType values to new ones
    const vehicleTypeMap: Record<string, string> = {
        'small': 'small',
        '5-seater': 'regular',
        '7-seater': 'big',
    };

    for (const [oldType, newType] of Object.entries(vehicleTypeMap)) {
        const result = await appointments.updateMany(
            { vehicleType: oldType },
            { $set: { vehicleType: newType } }
        );
        if (result.modifiedCount > 0) {
            console.log(`Migrated ${result.modifiedCount} appointments: vehicleType '${oldType}' -> '${newType}'`);
        }
    }

    // Set durationMinutes on all appointments that don't have it yet
    // Existing appointments keep 59 min (their original booking duration)
    const noDuration = await appointments.updateMany(
        { durationMinutes: { $exists: false } },
        { $set: { durationMinutes: 59 } }
    );
    if (noDuration.modifiedCount > 0) {
        console.log(`Set durationMinutes=59 on ${noDuration.modifiedCount} existing appointments`);
    }

    // Set vehicleType on appointments that have none
    const noVehicleType = await appointments.updateMany(
        { vehicleType: { $exists: false } },
        { $set: { vehicleType: 'regular' } }
    );
    if (noVehicleType.modifiedCount > 0) {
        console.log(`Set vehicleType='regular' on ${noVehicleType.modifiedCount} appointments with no vehicleType`);
    }

    // 3. Add default weekly schedule to workers that don't have one
    const workers = db.collection('workers');
    const defaultSchedule = {
        '0': { isWorking: true, startTime: '08:30', endTime: '17:00' },
        '1': { isWorking: true, startTime: '08:30', endTime: '17:00' },
        '2': { isWorking: true, startTime: '08:30', endTime: '17:00' },
        '3': { isWorking: true, startTime: '08:30', endTime: '17:00' },
        '4': { isWorking: true, startTime: '08:30', endTime: '17:00' },
        '5': { isWorking: false, startTime: '08:30', endTime: '17:00' },
        '6': { isWorking: false, startTime: '08:30', endTime: '17:00' },
    };
    const noSchedule = await workers.updateMany(
        { weeklySchedule: { $exists: false } },
        { $set: { weeklySchedule: defaultSchedule } }
    );
    if (noSchedule.modifiedCount > 0) {
        console.log(`Added default schedule to ${noSchedule.modifiedCount} workers`);
    }

    console.log('Migration complete!');
    await mongoose.disconnect();
}

migrate().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
