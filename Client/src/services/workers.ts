import api from './api';
import type { IWorker, IWorkerAvailability, CreateWorkerInput, WeeklySchedule } from '@/types';

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

export const createWorker = async (payload: CreateWorkerInput): Promise<IWorker> => {
    const { data } = await api.post('/api/workers', payload);
    return data.data;
};

export const updateWorker = async (id: string, payload: Partial<CreateWorkerInput>): Promise<IWorker> => {
    const { data } = await api.put(`/api/workers/${id}`, payload);
    return data.data;
};

export const updateWorkerSchedule = async (id: string, schedule: WeeklySchedule): Promise<IWorker> => {
    const { data } = await api.put(`/api/workers/${id}/schedule`, schedule);
    return data.data;
};

export const deleteWorker = async (id: string): Promise<void> => {
    await api.delete(`/api/workers/${id}`);
};
