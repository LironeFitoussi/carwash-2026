import api from './api';
import type { ICarSizeConfig } from '@/types';

export const getCarSizeConfigs = async (): Promise<ICarSizeConfig[]> => {
    const { data } = await api.get('/api/car-size-config');
    return data.data;
};

export const updateCarSizeConfig = async (
    key: string,
    payload: { label?: { en: string; he: string }; durationMinutes?: number }
): Promise<ICarSizeConfig> => {
    const { data } = await api.put(`/api/car-size-config/${key}`, payload);
    return data.data;
};
