import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Plus, UserCircle, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
    fetchWorkers,
    deleteWorker,
    getWorkerAvailabilityDates,
    assignAvailability,
    deleteAvailability,
} from '@/services/workers';
import type { IWorker, IWorkerAvailabilityDate } from '@/types';

type ScheduleModal = 'assign' | 'edit' | null;

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

// --- Schedule Panel (shown when a worker is selected) ---

function WorkerSchedulePanel({ worker }: { worker: IWorker }) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [modal, setModal] = useState<ScheduleModal>(null);

    const now = new Date();
    const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
    const [viewYear, setViewYear] = useState(now.getFullYear());

    // Assign form state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('08:30');
    const [endTime, setEndTime] = useState('17:00');

    // Edit form state
    const [editDate, setEditDate] = useState('');
    const [editStartTime, setEditStartTime] = useState('');
    const [editEndTime, setEditEndTime] = useState('');

    const queryKey = ['workerAvailability', worker._id, viewMonth, viewYear];

    const { data: dates = [], isLoading } = useQuery({
        queryKey,
        queryFn: () => getWorkerAvailabilityDates(worker._id, viewMonth, viewYear),
    });

    const assignMutation = useMutation({
        mutationFn: () =>
            assignAvailability({ workerId: worker._id, startDate, endDate, startTime, endTime }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey });
            toast.success(t('workers.schedule.assigned', { count: data.count }));
            setStartDate('');
            setEndDate('');
            setModal(null);
        },
        onError: () => toast.error(t('common.error')),
    });

    const editMutation = useMutation({
        mutationFn: () =>
            assignAvailability({ workerId: worker._id, startDate: editDate, endDate: editDate, startTime: editStartTime, endTime: editEndTime }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            toast.success(t('workers.schedule.updated'));
            setModal(null);
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

    const canAssign = startDate && endDate && startTime && endTime;
    const canEdit = editStartTime && editEndTime;

    const openEditModal = (d: IWorkerAvailabilityDate) => {
        const dateStr = new Date(d.date).toISOString().split('T')[0];
        setEditDate(dateStr);
        setEditStartTime(d.startTime);
        setEditEndTime(d.endTime);
        setModal('edit');
    };

    const prevMonth = () => {
        if (viewMonth === 1) {
            setViewMonth(12);
            setViewYear((y) => y - 1);
        } else {
            setViewMonth((m) => m - 1);
        }
    };
    const nextMonth = () => {
        if (viewMonth === 12) {
            setViewMonth(1);
            setViewYear((y) => y + 1);
        } else {
            setViewMonth((m) => m + 1);
        }
    };

    const monthLabel = new Date(viewYear, viewMonth - 1).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="space-y-4">
            {/* Add hours button */}
            <Button size="sm" onClick={() => setModal('assign')}>
                <Plus className="w-4 h-4 mr-1" />
                {t('workers.schedule.tabs.assign')}
            </Button>

            {/* Schedule list */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={prevMonth}>
                        &laquo;
                    </Button>
                    <span className="text-sm font-medium">{monthLabel}</span>
                    <Button variant="outline" size="sm" onClick={nextMonth}>
                        &raquo;
                    </Button>
                </div>

                {isLoading ? (
                    <p className="text-sm text-gray-400">{t('common.loading')}</p>
                ) : dates.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">
                        {t('workers.schedule.no_dates')}
                    </p>
                ) : (
                    <div className="space-y-1.5">
                        {dates.map((d: IWorkerAvailabilityDate) => (
                            <div
                                key={d._id}
                                className="flex items-center justify-between bg-white border rounded-lg px-3 py-2.5 text-sm"
                            >
                                <span className="font-medium">{formatDate(d.date)}</span>
                                <span className="text-gray-500" dir="ltr">
                                    {d.startTime} - {d.endTime}
                                </span>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => openEditModal(d)}
                                    >
                                        <Pencil className="w-3 h-3" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                        onClick={() => {
                                            const dateStr = new Date(d.date)
                                                .toISOString()
                                                .split('T')[0];
                                            deleteMutation.mutate([dateStr]);
                                        }}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Assign Hours Modal */}
            <Dialog open={modal === 'assign'} onOpenChange={(open) => !open && setModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('workers.schedule.tabs.assign')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Label>{t('workers.schedule.start_date')}</Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>{t('workers.schedule.end_date')}</Label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>{t('workers.schedule.start_time')}</Label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="08:30"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full border rounded-md px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={() => assignMutation.mutate()}
                            disabled={!canAssign || assignMutation.isPending}
                            className="w-full"
                        >
                            {assignMutation.isPending
                                ? t('common.saving')
                                : t('workers.schedule.assign')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Hours Modal */}
            <Dialog open={modal === 'edit'} onOpenChange={(open) => !open && setModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {t('common.edit')} — {editDate && formatDate(editDate)}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>{t('workers.schedule.start_time')}</Label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="08:30"
                                    value={editStartTime}
                                    onChange={(e) => setEditStartTime(e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <Label>{t('workers.schedule.end_time')}</Label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="17:00"
                                    value={editEndTime}
                                    onChange={(e) => setEditEndTime(e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={() => editMutation.mutate()}
                            disabled={!canEdit || editMutation.isPending}
                            className="w-full"
                        >
                            {editMutation.isPending ? t('common.saving') : t('common.save')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// --- Main Workers Page ---

export default function Workers() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
    const [pendingDelete, setPendingDelete] = useState<IWorker | null>(null);

    const { data: workers = [], isLoading } = useQuery({
        queryKey: ['workers'],
        queryFn: fetchWorkers,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteWorker,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workers'] });
            toast.success(t('workers.deleted'));
            setPendingDelete(null);
            if (pendingDelete && selectedWorkerId === pendingDelete._id) {
                setSelectedWorkerId(null);
            }
        },
        onError: () => toast.error(t('common.error')),
    });

    const selectedWorker = workers.find((w) => w._id === selectedWorkerId) ?? null;

    if (isLoading) {
        return (
            <div className="flex justify-center py-12 text-gray-400">{t('common.loading')}</div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">{t('navigation.workers')}</h1>
                <Link to="/workers/new">
                    <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-1" />
                        {t('workers.add')}
                    </Button>
                </Link>
            </div>

            {/* Worker selector */}
            {workers.length === 0 ? (
                <p className="text-gray-400 text-center py-8">{t('workers.no_workers')}</p>
            ) : (
                <>
                    <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
                        {workers.map((worker) => (
                            <button
                                key={worker._id}
                                onClick={() =>
                                    setSelectedWorkerId(
                                        selectedWorkerId === worker._id ? null : worker._id
                                    )
                                }
                                className={cn(
                                    'flex-shrink-0 snap-start px-4 py-3 rounded-xl border-2 transition-all',
                                    'min-w-[110px] text-center',
                                    selectedWorkerId === worker._id
                                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                )}
                            >
                                <UserCircle
                                    className={cn(
                                        'w-8 h-8 mx-auto mb-1',
                                        selectedWorkerId === worker._id
                                            ? 'text-blue-500'
                                            : 'text-gray-400'
                                    )}
                                />
                                <p
                                    className={cn(
                                        'text-sm truncate',
                                        selectedWorkerId === worker._id && 'font-semibold'
                                    )}
                                >
                                    {worker.name}
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* Selected worker panel */}
                    {selectedWorker && (
                        <div className="border rounded-xl p-4 space-y-4 bg-white">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">{selectedWorker.name}</h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => setPendingDelete(selectedWorker)}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>

                            {selectedWorker.phone && (
                                <p className="text-sm text-gray-500">{selectedWorker.phone}</p>
                            )}

                            <WorkerSchedulePanel
                                key={selectedWorker._id}
                                worker={selectedWorker}
                            />
                        </div>
                    )}

                    {!selectedWorker && (
                        <p className="text-sm text-gray-400 text-center py-6">
                            {t('workers.schedule.select_worker')}
                        </p>
                    )}
                </>
            )}

            {/* Delete confirmation */}
            {pendingDelete && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 space-y-4">
                        <h2 className="font-semibold text-gray-900">
                            {t('workers.delete.title')}
                        </h2>
                        <p className="text-sm text-gray-600">
                            {t('workers.delete.confirm', { name: pendingDelete.name })}
                        </p>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setPendingDelete(null)}>
                                {t('common.cancel')}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => deleteMutation.mutate(pendingDelete._id)}
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending
                                    ? t('common.deleting')
                                    : t('common.delete')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
