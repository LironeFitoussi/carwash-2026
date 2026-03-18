import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchWorkers, getWorkerAvailabilityDates, assignAvailability, deleteAvailability } from '@/services/workers';
import type { IWorker, IWorkerAvailabilityDate } from '@/types';

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function WorkerAvailabilityPanel({ worker }: { worker: IWorker }) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const now = new Date();
    const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
    const [viewYear, setViewYear] = useState(now.getFullYear());

    // Assign form state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('08:30');
    const [endTime, setEndTime] = useState('17:00');

    const queryKey = ['workerAvailability', worker._id, viewMonth, viewYear];

    const { data: dates = [], isLoading } = useQuery({
        queryKey,
        queryFn: () => getWorkerAvailabilityDates(worker._id, viewMonth, viewYear),
    });

    const assignMutation = useMutation({
        mutationFn: () => assignAvailability({
            workerId: worker._id,
            startDate,
            endDate,
            startTime,
            endTime,
        }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey });
            toast.success(t('workers.schedule.assigned', { count: data.count }));
            setStartDate('');
            setEndDate('');
        },
        onError: () => toast.error(t('common.error')),
    });

    const deleteMutation = useMutation({
        mutationFn: (datesToDelete: string[]) => deleteAvailability(worker._id, datesToDelete),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            toast.success(t('workers.schedule.deleted'));
        },
        onError: () => toast.error(t('common.error')),
    });

    // Remove day state
    const [removeDate, setRemoveDate] = useState('');

    const removeDayMutation = useMutation({
        mutationFn: (dateToRemove: string) => deleteAvailability(worker._id, [dateToRemove]),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            toast.success(t('workers.schedule.day_removed'));
            setRemoveDate('');
        },
        onError: () => toast.error(t('common.error')),
    });

    const canAssign = startDate && endDate && startTime && endTime;

    const prevMonth = () => {
        if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const monthLabel = new Date(viewYear, viewMonth - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    return (
        <div className="border rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold">{worker.name}</h3>

            {/* Assign date range form */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <p className="text-sm font-medium text-gray-700">{t('workers.schedule.assign_range')}</p>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label>{t('workers.schedule.start_date')}</Label>
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div>
                        <Label>{t('workers.schedule.end_date')}</Label>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <div>
                        <Label>{t('workers.schedule.start_time')}</Label>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="08:30"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full border rounded-md px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <Label>{t('workers.schedule.end_time')}</Label>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="17:00"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full border rounded-md px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <Button
                    onClick={() => assignMutation.mutate()}
                    disabled={!canAssign || assignMutation.isPending}
                    className="w-full"
                >
                    {assignMutation.isPending ? t('common.saving') : t('workers.schedule.assign')}
                </Button>
            </div>

            {/* Mark day as non-working */}
            <div className="bg-red-50 rounded-lg p-3 space-y-3">
                <p className="text-sm font-medium text-red-700">{t('workers.schedule.remove_day')}</p>
                <div className="flex gap-2 items-end">
                    <div className="flex-1">
                        <Label>{t('workers.schedule.date')}</Label>
                        <Input type="date" value={removeDate} onChange={(e) => setRemoveDate(e.target.value)} />
                    </div>
                    <Button
                        variant="destructive"
                        onClick={() => removeDayMutation.mutate(removeDate)}
                        disabled={!removeDate || removeDayMutation.isPending}
                    >
                        {removeDayMutation.isPending ? '...' : t('workers.schedule.mark_off')}
                    </Button>
                </div>
            </div>

            {/* Month navigation + assigned dates list */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={prevMonth}>&laquo;</Button>
                    <span className="text-sm font-medium">{monthLabel}</span>
                    <Button variant="outline" size="sm" onClick={nextMonth}>&raquo;</Button>
                </div>

                {isLoading ? (
                    <p className="text-sm text-gray-400">{t('common.loading')}</p>
                ) : dates.length === 0 ? (
                    <p className="text-sm text-gray-400">{t('workers.schedule.no_dates')}</p>
                ) : (
                    <div className="space-y-1">
                        {dates.map((d) => (
                            <div key={d._id} className="flex items-center justify-between bg-white border rounded px-3 py-2 text-sm">
                                <span>{formatDate(d.date)}</span>
                                <span className="text-gray-500" dir="ltr">{d.startTime} - {d.endTime}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => {
                                        const dateStr = new Date(d.date).toISOString().split('T')[0];
                                        deleteMutation.mutate([dateStr]);
                                    }}
                                >
                                    {t('common.delete')}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
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
                <div className="space-y-6">
                    {workers.map((worker) => (
                        <WorkerAvailabilityPanel key={worker._id} worker={worker} />
                    ))}
                </div>
            )}
        </div>
    );
}
