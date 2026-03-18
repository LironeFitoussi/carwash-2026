import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { format, addDays, addWeeks, subDays, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import WeeklyCalendar from '@/components/organisms/WeeklyCalendar';
import DailyCalendar from '@/components/organisms/DailyCalendar';
import AppointmentDialogs from '@/components/organisms/AppointmentDialogs';
import { getAppointments } from '@/services/appointments';
import { useAppointmentMutations } from '@/hooks/useAppointmentMutations';
import type { IAppointment, CreateAppointmentInput } from '@/types';

type ViewMode = 'daily' | 'weekly';

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

function getClientName(clientId: IAppointment['clientId']): string {
    if (typeof clientId === 'object' && clientId !== null) return clientId.name;
    return String(clientId);
}

function getWorkerName(workerId: IAppointment['workerId']): string {
    if (typeof workerId === 'object' && workerId !== null) return workerId.name;
    return String(workerId);
}

export default function Appointments() {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'he';

    const [viewMode, setViewMode] = useState<ViewMode>('daily');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [editAppointment, setEditAppointment] = useState<IAppointment | null>(null);
    const [deleteAppointment, setDeleteAppointment] = useState<IAppointment | null>(null);
    const [detailsAppointment, setDetailsAppointment] = useState<IAppointment | null>(null);

    const { data: appointments = [], isLoading } = useQuery({
        queryKey: ['appointments'],
        queryFn: getAppointments,
    });

    const { statusMutation, updateMutation, deleteMutation } = useAppointmentMutations();

    const handlePrev = () => {
        if (viewMode === 'daily') setCurrentDate((d) => subDays(d, 1));
        else setCurrentDate((d) => subWeeks(d, 1));
    };

    const handleNext = () => {
        if (viewMode === 'daily') setCurrentDate((d) => addDays(d, 1));
        else setCurrentDate((d) => addWeeks(d, 1));
    };

    const handleEditSubmit = (data: CreateAppointmentInput) => {
        if (!editAppointment) return;
        updateMutation.mutate({ id: editAppointment._id, data }, { onSuccess: () => setEditAppointment(null) });
    };

    const handleDeleteConfirm = () => {
        if (!deleteAppointment) return;
        deleteMutation.mutate(deleteAppointment._id, { onSuccess: () => setDeleteAppointment(null) });
    };

    return (
        <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">{t('navigation.appointments')}</h1>
                <Link to="/appointments/new">
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        {t('appointments.table.add')}
                    </Button>
                </Link>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* View toggle — desktop only */}
                <div className="hidden md:flex gap-1">
                    <Button
                        variant={viewMode === 'daily' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('daily')}
                    >
                        {t('appointments.calendar.daily')}
                    </Button>
                    <Button
                        variant={viewMode === 'weekly' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('weekly')}
                    >
                        {t('appointments.calendar.weekly')}
                    </Button>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrev}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-32 text-center">
                        {viewMode === 'daily'
                            ? format(currentDate, 'MMM d, yyyy')
                            : `${format(currentDate, 'MMM d')} – ${format(addDays(currentDate, 6), 'MMM d, yyyy')}`}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleNext}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                        {t('appointments.calendar.today')}
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12 text-gray-400">{t('common.loading')}</div>
            ) : (
                <>
                    {/* Calendar view — mobile: daily only */}
                    <div className="bg-white rounded-xl border overflow-hidden">
                        <div className="md:hidden">
                            <DailyCalendar
                                appointments={appointments}
                                currentDate={currentDate}
                                onAppointmentClick={setDetailsAppointment}
                            />
                        </div>
                        <div className="hidden md:block">
                            {viewMode === 'daily' ? (
                                <DailyCalendar
                                    appointments={appointments}
                                    currentDate={currentDate}
                                    onAppointmentClick={setDetailsAppointment}
                                />
                            ) : (
                                <WeeklyCalendar
                                    appointments={appointments}
                                    currentDate={currentDate}
                                    onAppointmentClick={setDetailsAppointment}
                                />
                            )}
                        </div>
                    </div>

                    {/* Table view — desktop only */}
                    <div className="hidden md:block bg-white rounded-xl border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">{t('appointments.table.client')}</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">{t('appointments.table.worker')}</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">{t('appointments.table.start_time')}</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">{t('appointments.table.service_type')}</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">{t('appointments.table.vehicle_type')}</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">{t('appointments.table.status')}</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {appointments.map((apt) => (
                                    <tr key={apt._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">
                                            <div className="flex items-center gap-1">
                                                {apt.isPickedUp && (
                                                    <span title={apt.pickupLocation ?? ''}>
                                                        <Car className="w-3 h-3 text-blue-500" />
                                                    </span>
                                                )}
                                                {getClientName(apt.clientId)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{getWorkerName(apt.workerId)}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {format(new Date(apt.startTime), 'MMM d, HH:mm')}
                                        </td>
                                        <td className="px-4 py-3">
                                            {t(`appointments.service_types.${apt.serviceType}`)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {apt.vehicleType ? t(`appointments.vehicle_types.${apt.vehicleType}`) : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Select
                                                value={apt.status}
                                                onValueChange={(val) =>
                                                    statusMutation.mutate({ id: apt._id, status: val as IAppointment['status'] })
                                                }
                                            >
                                                <SelectTrigger className={`h-7 text-xs px-2 border-0 ${statusColors[apt.status] ?? ''}`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map((s) => (
                                                        <SelectItem key={s} value={s} className="text-xs">
                                                            {t(`appointments.status.${s}`)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs"
                                                    onClick={() => setEditAppointment(apt)}
                                                >
                                                    {t('common.edit')}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                                    onClick={() => setDeleteAppointment(apt)}
                                                >
                                                    {t('common.delete')}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {appointments.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                            {t('common.no_data')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <AppointmentDialogs
                editAppointment={editAppointment}
                deleteAppointment={deleteAppointment}
                detailsAppointment={detailsAppointment}
                onEditClose={() => setEditAppointment(null)}
                onDeleteClose={() => setDeleteAppointment(null)}
                onDetailsClose={() => setDetailsAppointment(null)}
                onEditSubmit={handleEditSubmit}
                onDeleteConfirm={handleDeleteConfirm}
                isEditLoading={updateMutation.isPending}
                isDeleteLoading={deleteMutation.isPending}
            />
        </div>
    );
}
