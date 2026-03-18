import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createWorker } from '@/services/workers';

const workerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
});

type WorkerFormValues = z.infer<typeof workerSchema>;

export default function AddWorker() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { register, handleSubmit, formState: { errors } } = useForm<WorkerFormValues>({
        resolver: zodResolver(workerSchema),
        defaultValues: { name: '', phone: '' },
    });

    const mutation = useMutation({
        mutationFn: createWorker,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workers'] });
            toast.success(t('workers.created'));
            navigate('/workers');
        },
        onError: () => toast.error(t('common.error')),
    });

    return (
        <div className="max-w-lg mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">{t('workers.add')}</h1>
            <div className="bg-white rounded-xl border p-6">
                <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                    <div>
                        <Label>{t('workers.form.name')}</Label>
                        <Input {...register('name')} placeholder={t('workers.form.name')} />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <Label>{t('workers.form.phone')}</Label>
                        <Input {...register('phone')} placeholder={t('workers.form.phone')} />
                    </div>

                    <Button type="submit" disabled={mutation.isPending} className="w-full">
                        {mutation.isPending ? t('common.saving') : t('common.save')}
                    </Button>
                </form>
            </div>
        </div>
    );
}
