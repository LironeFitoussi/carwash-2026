import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { fetchWorkers } from '@/services/workers';
import { searchClients } from '@/services/clients';
import { getNextAvailable } from '@/services/appointments';
import { getCarSizeConfigs } from '@/services/carSizeConfig';
import useDebounce from '@/hooks/useDebounce';
import { utcToDatetimeLocal } from '@/lib/utils';
import type { CreateAppointmentInput, VehicleType, CarType } from '@/types';

const appointmentFormSchema = z.object({
    clientId: z.string().min(1, 'Client is required'),
    workerId: z.string().min(1, 'Worker is required'),
    serviceType: z.enum(['basic', 'premium', 'deluxe']),
    startTime: z.string().min(1, 'Start time is required'),
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).default('pending'),
    notes: z.string().optional(),
    isPickedUp: z.boolean().default(false),
    pickupLocation: z.string().optional(),
    vehicleType: z.enum(['small', 'regular', 'big']),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
    initialData?: Partial<AppointmentFormValues>;
    onSubmit: (data: CreateAppointmentInput) => void;
    isLoading?: boolean;
}

const CAR_TYPE_TO_VEHICLE: Record<CarType, VehicleType> = {
    small: 'small',
    medium: 'regular',
    large: 'big',
    motorcycle: 'small',
};

function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
}

export default function AppointmentForm({ initialData, onSubmit, isLoading }: AppointmentFormProps) {
    const { t, i18n } = useTranslation();
    const [clientSearch, setClientSearch] = useState('');
    const debouncedSearch = useDebounce(clientSearch, 300);
    const lang = i18n.language === 'he' ? 'he' : 'en';

    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<AppointmentFormValues>({
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
    const selectedWorkerId = watch('workerId');
    const selectedVehicleType = watch('vehicleType');

    const { data: workers = [] } = useQuery({
        queryKey: ['workers'],
        queryFn: fetchWorkers,
    });

    const { data: clientResults = [] } = useQuery({
        queryKey: ['clients', 'search', debouncedSearch],
        queryFn: () => searchClients(debouncedSearch),
        enabled: debouncedSearch.length > 1,
    });

    const { data: carSizeConfigs = [] } = useQuery({
        queryKey: ['carSizeConfigs'],
        queryFn: getCarSizeConfigs,
    });

    const suggestMutation = useMutation({
        mutationFn: () => getNextAvailable(selectedWorkerId, selectedVehicleType),
        onSuccess: (data) => {
            setValue('startTime', utcToDatetimeLocal(data.suggestedTime));
        },
    });

    const canSuggest = selectedWorkerId && selectedVehicleType;
    const selectedConfig = carSizeConfigs.find(c => c.key === selectedVehicleType);

    // Auto-map client carType to vehicleType when a client is selected
    const [selectedClientCarType, setSelectedClientCarType] = useState<CarType | null>(null);
    useEffect(() => {
        if (selectedClientCarType && !initialData?.vehicleType) {
            setValue('vehicleType', CAR_TYPE_TO_VEHICLE[selectedClientCarType]);
        }
    }, [selectedClientCarType, setValue, initialData?.vehicleType]);

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
                                    clientResults.map((c: any) => (
                                        <button
                                            key={c._id}
                                            type="button"
                                            onClick={() => {
                                                field.onChange(c._id);
                                                setClientSearch(c.name);
                                                if (c.carType) {
                                                    setSelectedClientCarType(c.carType);
                                                }
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

            {/* Vehicle Type (Car Size) */}
            <div>
                <Label>{t('appointments.form.vehicle_type')}</Label>
                <Controller
                    name="vehicleType"
                    control={control}
                    render={({ field }) => (
                        <Select value={field.value ?? ''} onValueChange={field.onChange}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('appointments.form.vehicle_type')} />
                            </SelectTrigger>
                            <SelectContent>
                                {carSizeConfigs.map((config) => (
                                    <SelectItem key={config.key} value={config.key}>
                                        <span dir="ltr">{config.label[lang]} ({formatDuration(config.durationMinutes)})</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {selectedConfig && (
                    <p className="text-sm text-gray-500 mt-1">
                        {t('appointments.form.duration')}: {formatDuration(selectedConfig.durationMinutes)}
                    </p>
                )}
                {errors.vehicleType && <p className="text-sm text-red-500 mt-1">{errors.vehicleType.message}</p>}
            </div>

            {/* Start Time + Auto-suggest */}
            <div>
                <Label>{t('appointments.form.start_time')}</Label>
                <div className="flex gap-2">
                    <Input
                        type="datetime-local"
                        step={900}
                        {...register('startTime')}
                        className="flex-1"
                    />
                    {canSuggest && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => suggestMutation.mutate()}
                            disabled={suggestMutation.isPending}
                            className="whitespace-nowrap"
                        >
                            {suggestMutation.isPending ? '...' : t('appointments.form.suggest_next')}
                        </Button>
                    )}
                </div>
                {errors.startTime && <p className="text-sm text-red-500 mt-1">{errors.startTime.message}</p>}
                {suggestMutation.isError && (
                    <p className="text-sm text-red-500 mt-1">{t('appointments.form.no_available_slots')}</p>
                )}
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
