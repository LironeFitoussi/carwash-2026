import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCarSizeConfigs, updateCarSizeConfig } from '@/services/carSizeConfig';
import type { ICarSizeConfig } from '@/types';

function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
}

function ConfigRow({ config }: { config: ICarSizeConfig }) {
    const { t, i18n } = useTranslation();
    const queryClient = useQueryClient();
    const lang = i18n.language === 'he' ? 'he' : 'en';
    const [duration, setDuration] = useState(config.durationMinutes);
    const [labelEn, setLabelEn] = useState(config.label.en);
    const [labelHe, setLabelHe] = useState(config.label.he);

    const mutation = useMutation({
        mutationFn: () => updateCarSizeConfig(config.key, {
            durationMinutes: duration,
            label: { en: labelEn, he: labelHe },
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['carSizeConfigs'] });
            toast.success(t('settings.car_sizes.updated'));
        },
        onError: () => {
            toast.error(t('common.error'));
        },
    });

    const hasChanges = duration !== config.durationMinutes
        || labelEn !== config.label.en
        || labelHe !== config.label.he;

    return (
        <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{config.label[lang]}</h3>
                <span className="text-sm text-gray-500">{formatDuration(config.durationMinutes)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label>{t('settings.car_sizes.label_en')}</Label>
                    <Input value={labelEn} onChange={(e) => setLabelEn(e.target.value)} />
                </div>
                <div>
                    <Label>{t('settings.car_sizes.label_he')}</Label>
                    <Input value={labelHe} onChange={(e) => setLabelHe(e.target.value)} dir="rtl" />
                </div>
            </div>

            <div>
                <Label>{t('settings.car_sizes.duration')}</Label>
                <Input
                    type="number"
                    min={15}
                    max={480}
                    step={15}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                />
            </div>

            {hasChanges && (
                <Button
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isPending}
                    className="w-full"
                >
                    {mutation.isPending ? t('common.saving') : t('common.save')}
                </Button>
            )}
        </div>
    );
}

export default function CarSizeSettings() {
    const { t } = useTranslation();

    const { data: configs = [], isLoading } = useQuery({
        queryKey: ['carSizeConfigs'],
        queryFn: getCarSizeConfigs,
    });

    if (isLoading) return <p>{t('common.loading')}</p>;

    return (
        <div className="max-w-lg mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">{t('settings.car_sizes.title')}</h1>
            <p className="text-gray-500">{t('settings.car_sizes.description')}</p>

            <div className="space-y-4">
                {configs.map((config) => (
                    <ConfigRow key={config.key} config={config} />
                ))}
            </div>
        </div>
    );
}
