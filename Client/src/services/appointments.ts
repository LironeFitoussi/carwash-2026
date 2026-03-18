import api from './api';
import type { IAppointment, AppointmentStatus, CreateAppointmentInput, INextAvailable } from '@/types';

export const getAppointments = async (): Promise<IAppointment[]> => {
    const { data } = await api.get('/api/appointments');
    return data.data;
};

export const getAppointmentById = async (id: string): Promise<IAppointment> => {
    const { data } = await api.get(`/api/appointments/${id}`);
    return data.data;
};

export const getAppointmentsByWorker = async (workerId: string): Promise<IAppointment[]> => {
    const { data } = await api.get(`/api/appointments/worker/${workerId}`);
    return data.data;
};

export const getAppointmentsByClient = async (clientId: string): Promise<IAppointment[]> => {
    const { data } = await api.get(`/api/appointments/client/${clientId}`);
    return data.data;
};

export const createAppointment = async (payload: CreateAppointmentInput): Promise<IAppointment> => {
    const { data } = await api.post('/api/appointments', payload);
    return data.data;
};

export const updateAppointment = async (id: string, payload: Partial<CreateAppointmentInput>): Promise<IAppointment> => {
    const { data } = await api.put(`/api/appointments/${id}`, payload);
    return data.data;
};

export const deleteAppointment = async (id: string): Promise<void> => {
    await api.delete(`/api/appointments/${id}`);
};

export const switchAppointmentStatus = async (id: string, status: AppointmentStatus): Promise<IAppointment> => {
    const { data } = await api.post(`/api/appointments/${id}/switch-status/${status}`);
    return data.data;
};

export const getNextAvailable = async (workerId: string, carSize: string): Promise<INextAvailable> => {
    const { data } = await api.get('/api/appointments/next-available', {
        params: { workerId, carSize },
    });
    return data.data;
};
