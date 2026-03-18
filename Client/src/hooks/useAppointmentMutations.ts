import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { switchAppointmentStatus, updateAppointment, deleteAppointment } from '@/services/appointments';
import type { IAppointment, AppointmentStatus, CreateAppointmentInput } from '@/types';
import { useTranslation } from 'react-i18next';

export function useAppointmentMutations() {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
            switchAppointmentStatus(id, status),

        onMutate: async ({ id, status }) => {
            await queryClient.cancelQueries({ queryKey: ['appointments'] });
            const snapshot = queryClient.getQueryData<IAppointment[]>(['appointments']);

            queryClient.setQueryData<IAppointment[]>(['appointments'], (old) =>
                old?.map((a) => (a._id === id ? { ...a, status } : a)) ?? []
            );

            return { snapshot };
        },

        onError: (_err, _vars, context) => {
            if (context?.snapshot) {
                queryClient.setQueryData(['appointments'], context.snapshot);
            }
            toast.error(t('appointments.update.error'));
        },

        onSuccess: () => {
            toast.success(t('appointments.update.success'));
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateAppointmentInput> }) =>
            updateAppointment(id, data),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            toast.success(t('appointments.update.success'));
        },

        onError: () => {
            toast.error(t('appointments.update.error'));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteAppointment(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            toast.success(t('appointments.delete.success'));
        },

        onError: () => {
            toast.error(t('appointments.delete.error'));
        },
    });

    return { statusMutation, updateMutation, deleteMutation };
}
