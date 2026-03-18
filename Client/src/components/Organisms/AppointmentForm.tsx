import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { fetchWorkers } from '@/services/workers';
import { searchClients } from '@/services/clients';
import useDebounce from '@/hooks/useDebounce';
import type { CreateAppointmentInput } from '@/types';

const appointmentFormSchema = z.object({
    clientId: z.string().min(1, 'Client is required'),
    workerId: z.string().min(1, 'Worker is required'),
    serviceType: z.enum(['basic', 'premium', 'deluxe']),
    startTime: z.string().min(1, 'Start time is required'),
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).default('pending'),
    notes: z.string().optional(),
    isPickedUp: z.boolean().default(false),
    pickupLocation: z.string().optional(),
    vehicleType: z.enum(['small', '5-seater', '7-seater']).optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
    initialData?: Partial<AppointmentFormValues>;
    onSubmit: (data: CreateAppointmentInput) => void;
    isLoading?: boolean;
}

export default function AppointmentForm({ initialData, onSubmit, isLoading }: AppointmentFormProps) {
    const { t } = useTranslation();
    const [clientSearch, setClientSearch] = useState('');
    const debouncedSearch = useDebounce(clientSearch, 300);

    const { register, handleSubmit, control, watch, formState: { errors } } = useForm<AppointmentFormValues>({
        resolver: zodResolver(appointmentFormSchema),
        defaultValues: {
            clientId: '',
            workerId: '',
            serviceType: 'basic',
            startTime: '',
            status: 'pending',
            notes: '',
            isPickedUp: false,
            pickupLocation: '',
            vehicleType: undefined,
            ...initialData,
        },
    });

    const isPickedUp = watch('isPickedUp');

    const { data: workers = [] } = useQuery({
        queryKey: ['workers'],
        queryFn: fetchWorkers,
    });

    const { data: clientResults = [] } = useQuery({
        queryKey: ['clients', 'search', debouncedSearch],
        queryFn: () => searchClients(debouncedSearch),
        enabled: debouncedSearch.length > 1,
    });

    return (
        <form onSubmit={handleSubmit((data) => onSubmit(data as CreateAppointmentInput))} className="space-y-4">
            {/* Client */}
            <div>
                <Label>{t('appointments.form.client')}</Label>
                <Input
                    placeholder={t('appointments.form.search_client')}
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                />
                {debouncedSearch.length > 1 && (
                    <Controller
                        name="clientId"
                        control={control}
                        render={({ field }) => (
                            <div className="border rounded-md mt-1 max-h-40 overflow-y-auto">
                                {clientResults.length === 0 ? (
                                    <p className="px-3 py-2 text-sm text-gray-500">{t('common.no_results')}</p>
                                ) : (
                                    clientResults.map((c) => (
                                        <button
                                            key={c._id}
                                            type="button"
                                            onClick={() => {
                                                field.onChange(c._id);
                                                setClientSearch(c.name);
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${field.value === c._id ? 'bg-blue-50 text-blue-700' : ''}`}
                                        >
                                            {c.name}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    />
                )}
                {errors.clientId && <p className="text-sm text-red-500 mt-1">{errors.clientId.message}</p>}
            </div>

            {/* Worker */}
            <div>
                <Label>{t('appointments.form.worker')}</Label>
                <Controller
                    name="workerId"
                    control={control}
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('appointments.form.select_worker')} />
                            </SelectTrigger>
                            <SelectContent>
                                {workers.map((w) => (
                                    <SelectItem key={w._id} value={w._id}>
                                        {w.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.workerId && <p className="text-sm text-red-500 mt-1">{errors.workerId.message}</p>}
            </div>

            {/* Start Time */}
            <div>
                <Label>{t('appointments.form.start_time')}</Label>
                <Input
                    type="datetime-local"
                    step={900}
                    {...register('startTime')}
                />
                {errors.startTime && <p className="text-sm text-red-500 mt-1">{errors.startTime.message}</p>}
            </div>

            {/* Service Type */}
            <div>
                <Label>{t('appointments.form.service_type')}</Label>
                <Controller
                    name="serviceType"
                    control={control}
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {(['basic', 'premium', 'deluxe'] as const).map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {t(`appointments.service_types.${type}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            {/* Vehicle Type */}
            <div>
                <Label>{t('appointments.form.vehicle_type')}</Label>
                <Controller
                    name="vehicleType"
                    control={control}
                    render={({ field }) => (
                        <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || undefined)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('common.optional')} />
                            </SelectTrigger>
                            <SelectContent>
                                {(['small', '5-seater', '7-seater'] as const).map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {t(`appointments.vehicle_types.${type}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            {/* Status */}
            <div>
                <Label>{t('appointments.form.status')}</Label>
                <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {t(`appointments.status.${s}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            {/* Pickup */}
            <div className="flex items-center gap-3">
                <Controller
                    name="isPickedUp"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="isPickedUp"
                        />
                    )}
                />
                <Label htmlFor="isPickedUp">{t('appointments.pickup.label')}</Label>
            </div>

            {isPickedUp && (
                <div>
                    <Label>{t('appointments.pickup.location')}</Label>
                    <Input {...register('pickupLocation')} placeholder={t('appointments.pickup.location_placeholder')} />
                </div>
            )}

            {/* Notes */}
            <div>
                <Label>{t('appointments.form.notes')}</Label>
                <textarea
                    {...register('notes')}
                    rows={3}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('appointments.form.notes')}
                />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? t('common.saving') : t('common.save')}
            </Button>
        </form>
    );
}
