import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import ClientForm from '@/components/organisms/ClientForm';
import { createClient } from '@/services/clients';
import type { CreateClientInput } from '@/types';

export default function NewClient() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: createClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast.success(t('clients.created'));
            navigate('/clients');
        },
        onError: () => toast.error(t('common.error')),
    });

    return (
        <div className="max-w-lg mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">{t('clients.add')}</h1>
            <div className="bg-white rounded-xl border p-6">
                <ClientForm
                    onSubmit={(data: CreateClientInput) => mutation.mutate(data)}
                    isLoading={mutation.isPending}
                />
            </div>
        </div>
    );
}
