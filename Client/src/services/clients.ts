import api from './api';
import type { IClient, IClientSearchResult, CreateClientInput } from '@/types';

export const getClients = async (): Promise<IClient[]> => {
    const { data } = await api.get('/api/clients');
    return data.data;
};

export const searchClients = async (name: string): Promise<IClientSearchResult[]> => {
    const { data } = await api.get('/api/clients/search', { params: { name } });
    return data.data;
};

export const getClientById = async (id: string): Promise<IClient> => {
    const { data } = await api.get(`/api/clients/${id}`);
    return data.data;
};

export const createClient = async (payload: CreateClientInput): Promise<IClient> => {
    const { data } = await api.post('/api/clients', payload);
    return data.data;
};

export const updateClient = async (id: string, payload: Partial<CreateClientInput>): Promise<IClient> => {
    const { data } = await api.put(`/api/clients/${id}`, payload);
    return data.data;
};

export const deleteClient = async (id: string): Promise<void> => {
    await api.delete(`/api/clients/${id}`);
};
