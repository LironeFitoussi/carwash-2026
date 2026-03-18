import api from './api';
import type { IWorker, IWorkerAvailability, CreateWorkerInput, IWorkerAvailabilityDate, AssignAvailabilityInput } from '@/types';

export const fetchWorkers = async (): Promise<IWorker[]> => {
    const { data } = await api.get('/api/workers');
    return data.data;
};

export const getWorkerById = async (id: string): Promise<IWorker> => {
    const { data } = await api.get(`/api/workers/${id}`);
    return data.data;
};

export const getWorkerByName = async (name: string): Promise<IWorker> => {
    const { data } = await api.get(`/api/workers/name/${name}`);
    return data.data;
};

export const getWorkerAvailability = async (workerId: string, date: string, carSize?: string): Promise<IWorkerAvailability> => {
    const { data } = await api.get(`/api/workers/${workerId}/availability`, {
        params: { date, ...(carSize && { carSize }) },
    });
    return data.data;
};

export const getWorkerAvailabilityDates = async (workerId: string, month: number, year: number): Promise<IWorkerAvailabilityDate[]> => {
    const { data } = await api.get(`/api/workers/${workerId}/availability-dates`, {
        params: { month, year },
    });
    return data.data;
};

export const assignAvailability = async (payload: AssignAvailabilityInput): Promise<{ count: number }> => {
    const { data } = await api.post('/api/workers/availability/assign', payload);
    return data.data;
};

export const deleteAvailability = async (workerId: string, dates: string[]): Promise<{ deletedCount: number }> => {
    const { data } = await api.post('/api/workers/availability/delete', { workerId, dates });
    return data.data;
};

export const createWorker = async (payload: CreateWorkerInput): Promise<IWorker> => {
    const { data } = await api.post('/api/workers', payload);
    return data.data;
};

export const updateWorker = async (id: string, payload: Partial<CreateWorkerInput>): Promise<IWorker> => {
    const { data } = await api.put(`/api/workers/${id}`, payload);
    return data.data;
};

export const deleteWorker = async (id: string): Promise<void> => {
    await api.delete(`/api/workers/${id}`);
};
