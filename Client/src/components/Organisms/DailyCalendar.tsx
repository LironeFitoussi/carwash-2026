import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import type { IAppointment } from '@/types';

interface DailyCalendarProps {
    appointments: IAppointment[];
    currentDate?: Date;
    onAppointmentClick?: (appointment: IAppointment) => void;
}

const HOUR_START = 8;
const HOUR_END = 21;
const HOUR_HEIGHT = 80;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

const serviceColors: Record<string, string> = {
    basic: 'bg-blue-100 border-blue-300 text-blue-800',
    premium: 'bg-purple-100 border-purple-300 text-purple-800',
    deluxe: 'bg-amber-100 border-amber-300 text-amber-800',
};

const statusOpacity: Record<string, string> = {
    pending: 'opacity-90',
    confirmed: 'opacity-100',
    completed: 'opacity-50',
    cancelled: 'opacity-30',
};

function getClientName(clientId: IAppointment['clientId']): string {
    if (typeof clientId === 'string') return clientId;
    return clientId.name;
}

function getWorkerName(workerId: IAppointment['workerId']): string {
    if (typeof workerId === 'string') return workerId;
    return workerId.name;
}

function getTopOffset(startTime: string): number {
    const date = new Date(startTime);
    const hour = date.getHours();
    const minute = date.getMinutes();
    return (hour - HOUR_START) * HOUR_HEIGHT + (minute / 60) * HOUR_HEIGHT;
}

export default function DailyCalendar({ appointments, currentDate = new Date(), onAppointmentClick }: DailyCalendarProps) {
    const { t } = useTranslation();

    const dayAppointments = appointments.filter((apt) => {
        const aptDate = new Date(apt.startTime);
        return (
            aptDate.getFullYear() === currentDate.getFullYear() &&
            aptDate.getMonth() === currentDate.getMonth() &&
            aptDate.getDate() === currentDate.getDate()
        );
    });

    const totalHeight = (HOUR_END - HOUR_START) * HOUR_HEIGHT;

    return (
        <div>
            {/* Header */}
            <div className="text-center py-2 font-medium text-gray-700 border-b">
                {format(currentDate, 'EEEE, MMMM d, yyyy')}
            </div>

            {/* Grid */}
            <div className="flex">
                {/* Time column */}
                <div className="w-14 shrink-0 relative" style={{ height: totalHeight }}>
                    {HOURS.map((hour) => (
                        <div
                            key={hour}
                            className="absolute w-full text-right pr-2 text-xs text-gray-400"
                            style={{ top: (hour - HOUR_START) * HOUR_HEIGHT - 7 }}
                        >
                            {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                        </div>
                    ))}
                </div>

                {/* Day column */}
                <div className="flex-1 border-l relative" style={{ height: totalHeight }}>
                    {/* Hour lines */}
                    {HOURS.map((hour) => (
                        <div
                            key={hour}
                            className="absolute w-full border-t border-gray-100"
                            style={{ top: (hour - HOUR_START) * HOUR_HEIGHT }}
                        />
                    ))}

                    {/* Appointments */}
                    {dayAppointments.map((apt) => {
                        const top = getTopOffset(apt.startTime);
                        if (top < 0 || top > totalHeight) return null;
                        const colorClass = serviceColors[apt.serviceType] ?? 'bg-gray-100 border-gray-300 text-gray-800';
                        const opacityClass = statusOpacity[apt.status] ?? 'opacity-100';
                        const isCancelled = apt.status === 'cancelled';
                        return (
                            <button
                                key={apt._id}
                                onClick={() => onAppointmentClick?.(apt)}
                                className={`absolute left-1 right-1 border rounded text-sm p-2 text-left cursor-pointer hover:brightness-95 transition-all ${colorClass} ${opacityClass}`}
                                style={{ top, height: HOUR_HEIGHT - 4 }}
                            >
                                <p className={`font-medium truncate ${isCancelled ? 'line-through' : ''}`}>
                                    {getClientName(apt.clientId)}
                                </p>
                                <p className="truncate text-xs opacity-75">
                                    {getWorkerName(apt.workerId)} · {t(`appointments.service_types.${apt.serviceType}`)}
                                </p>
                                <p className="text-xs opacity-60">
                                    {format(new Date(apt.startTime), 'HH:mm')}
                                </p>
                            </button>
                        );
                    })}

                    {dayAppointments.length === 0 && (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                            {t('appointments.calendar.no_appointments')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
