export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type ServiceType = 'basic' | 'premium' | 'deluxe';
export type VehicleType = 'small' | '5-seater' | '7-seater';
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

export interface IWorker {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    specialties: string[];
    isActive: boolean;
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
    vehicleType?: VehicleType;
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
    availableSlots: ITimeSlot[];
    bookedSlots: ITimeSlot[];
    appointments: IAppointment[];
}

export interface IClientSearchResult {
    _id: string;
    name: string;
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
    vehicleType?: VehicleType;
}
