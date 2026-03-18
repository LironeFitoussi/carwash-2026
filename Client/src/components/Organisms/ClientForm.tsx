import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { CreateClientInput } from '@/types';

const clientSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
    notes: z.string().optional(),
    carType: z.enum(['small', 'medium', 'large', 'motorcycle']),
    isActive: z.boolean(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientFormProps {
    initialData?: Partial<ClientFormValues>;
    onSubmit: (data: CreateClientInput) => void;
    isLoading?: boolean;
    hideSubmitButton?: boolean;
}

export default function ClientForm({ initialData, onSubmit, isLoading, hideSubmitButton }: ClientFormProps) {
    const { t } = useTranslation();

    const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<ClientFormValues>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            name: '',
            phone: '',
            notes: '',
            carType: 'small',
            isActive: true,
            ...initialData,
        },
    });

    const watchedValues = watch();

    // Auto-submit when form is valid and hideSubmitButton is true
    useEffect(() => {
        if (hideSubmitButton && isValid) {
            onSubmit(watchedValues as CreateClientInput);
        }
    }, [watchedValues, isValid, hideSubmitButton]);

    return (
        <form onSubmit={handleSubmit((data) => onSubmit(data as CreateClientInput))} className="space-y-4">
            <div>
                <Label htmlFor="name">{t('clients.form.name')}</Label>
                <Input id="name" {...register('name')} placeholder={t('clients.form.name')} />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
                <Label htmlFor="phone">{t('clients.form.phone')}</Label>
                <Input id="phone" {...register('phone')} placeholder={t('clients.form.phone')} />
            </div>

            <div>
                <Label htmlFor="carType">{t('clients.form.car_type')}</Label>
                <Select
                    defaultValue={initialData?.carType || 'small'}
                    onValueChange={(val) => setValue('carType', val as ClientFormValues['carType'])}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {(['small', 'medium', 'large', 'motorcycle'] as const).map((type) => (
                            <SelectItem key={type} value={type}>
                                {t(`clients.car_types.${type}`)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label htmlFor="notes">{t('clients.form.notes')}</Label>
                <textarea
                    id="notes"
                    {...register('notes')}
                    rows={3}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('clients.form.notes')}
                />
            </div>

            <div className="flex items-center gap-2">
                <Checkbox
                    id="isActive"
                    defaultChecked={initialData?.isActive !== false}
                    onCheckedChange={(checked) => setValue('isActive', !!checked)}
                />
                <Label htmlFor="isActive">{t('clients.form.active')}</Label>
            </div>

            {!hideSubmitButton && (
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? t('common.saving') : t('common.save')}
                </Button>
            )}
        </form>
    );
}
