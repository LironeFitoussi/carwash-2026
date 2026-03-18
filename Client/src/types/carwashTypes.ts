export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type ServiceType = 'basic' | 'premium' | 'deluxe';
export type VehicleType = 'small' | 'regular' | 'big';
export type CarType = 'small' | 'medium' | 'large' | 'motorcycle';

export interface IClient {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    notes?: string;
    carType: CarType;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IDaySchedule {
    isWorking: boolean;
    startTime: string; // "HH:mm"
    endTime: string;   // "HH:mm"
}

export type WeeklySchedule = Record<string, IDaySchedule>;

export interface IWorker {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    specialties: string[];
    isActive: boolean;
    weeklySchedule: WeeklySchedule;
    createdAt: string;
    updatedAt: string;
}

export interface IAppointment {
    _id: string;
    clientId: IClient | string;
    workerId: IWorker | string;
    serviceType: ServiceType;
    startTime: string;
    status: AppointmentStatus;
    notes?: string;
    isPickedUp: boolean;
    pickupLocation?: string;
    vehicleType: VehicleType;
    durationMinutes: number;
    createdAt: string;
    updatedAt: string;
}

export interface ITimeSlot {
    start: string;
    end: string;
}

export interface IWorkerAvailability {
    workerId: string;
    date: string;
    carSize: VehicleType;
    durationMinutes: number;
    availableSlots: ITimeSlot[];
    bookedSlots: ITimeSlot[];
    appointments: IAppointment[];
}

export interface ICarSizeConfig {
    _id: string;
    key: VehicleType;
    label: { en: string; he: string };
    durationMinutes: number;
    sortOrder: number;
}

export interface INextAvailable {
    suggestedTime: string;
    durationMinutes: number;
}

export interface IClientSearchResult {
    _id: string;
    name: string;
    carType?: CarType;
}

// Form input types
export interface CreateClientInput {
    name: string;
    email?: string;
    phone?: string;
    notes?: string;
    carType: CarType;
    isActive?: boolean;
}

export interface CreateWorkerInput {
    name: string;
    email?: string;
    phone?: string;
    specialties?: string[];
    isActive?: boolean;
}

export interface CreateAppointmentInput {
    clientId: string;
    workerId: string;
    serviceType: ServiceType;
    startTime: string;
    status?: AppointmentStatus;
    notes?: string;
    isPickedUp?: boolean;
    pickupLocation?: string;
    vehicleType: VehicleType;
}
