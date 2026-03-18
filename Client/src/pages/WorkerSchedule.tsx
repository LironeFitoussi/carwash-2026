import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchWorkers, updateWorkerSchedule } from '@/services/workers';
import type { IWorker, WeeklySchedule } from '@/types';

const DAY_KEYS = ['0', '1', '2', '3', '4', '5', '6'] as const;

const DEFAULT_SCHEDULE: WeeklySchedule = {
    '0': { isWorking: true, startTime: '08:30', endTime: '17:00' },
    '1': { isWorking: true, startTime: '08:30', endTime: '17:00' },
    '2': { isWorking: true, startTime: '08:30', endTime: '17:00' },
    '3': { isWorking: true, startTime: '08:30', endTime: '17:00' },
    '4': { isWorking: true, startTime: '08:30', endTime: '17:00' },
    '5': { isWorking: false, startTime: '08:30', endTime: '17:00' },
    '6': { isWorking: false, startTime: '08:30', endTime: '17:00' },
};

function ScheduleEditor({ worker }: { worker: IWorker }) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [schedule, setSchedule] = useState<WeeklySchedule>(
        worker.weeklySchedule || DEFAULT_SCHEDULE
    );

    useEffect(() => {
        setSchedule(worker.weeklySchedule || DEFAULT_SCHEDULE);
    }, [worker]);

    const mutation = useMutation({
        mutationFn: () => updateWorkerSchedule(worker._id, schedule),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workers'] });
            toast.success(t('workers.schedule.updated'));
        },
        onError: () => toast.error(t('common.error')),
    });

    const updateDay = (day: string, field: string, value: string | boolean) => {
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: value },
        }));
    };

    const hasChanges = JSON.stringify(schedule) !== JSON.stringify(worker.weeklySchedule);

    return (
        <div className="border rounded-lg p-4 space-y-3">
            <h3 className="text-lg font-semibold">{worker.name}</h3>

            <div className="space-y-2">
                {DAY_KEYS.map((day) => {
                    const daySchedule = schedule[day];
                    return (
                        <div key={day} className="grid grid-cols-[80px_auto_1fr] items-center gap-3 py-2 border-b last:border-b-0">
                            <span className="text-sm font-medium">
                                {t(`workers.schedule.days.${day}`)}
                            </span>
                            <Switch
                                checked={daySchedule.isWorking}
                                onCheckedChange={(v) => updateDay(day, 'isWorking', v)}
                            />
                            <div className="flex items-center gap-2">
                                {daySchedule.isWorking ? (
                                    <>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="\d{2}:\d{2}"
                                            placeholder="08:30"
                                            value={daySchedule.startTime}
                                            onChange={(e) => updateDay(day, 'startTime', e.target.value)}
                                            className="w-20 border rounded-md px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="\d{2}:\d{2}"
                                            placeholder="17:00"
                                            value={daySchedule.endTime}
                                            onChange={(e) => updateDay(day, 'endTime', e.target.value)}
                                            className="w-20 border rounded-md px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </>
                                ) : (
                                    <span className="text-sm text-gray-400">{t('workers.schedule.day_off')}</span>
                                )}
                            </div>
                        </div>
                    );
                })}
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

export default function WorkerSchedule() {
    const { t } = useTranslation();

    const { data: workers = [], isLoading } = useQuery({
        queryKey: ['workers'],
        queryFn: fetchWorkers,
    });

    if (isLoading) return <p>{t('common.loading')}</p>;

    return (
        <div className="max-w-2xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">{t('workers.schedule.title')}</h1>
            <p className="text-gray-500">{t('workers.schedule.description')}</p>

            {workers.length === 0 ? (
                <p className="text-gray-400">{t('workers.no_workers')}</p>
            ) : (
                <div className="space-y-4">
                    {workers.map((worker) => (
                        <ScheduleEditor key={worker._id} worker={worker} />
                    ))}
                </div>
            )}
        </div>
    );
}
