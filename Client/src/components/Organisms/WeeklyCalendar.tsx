import { useTranslation } from 'react-i18next';
import { format, startOfWeek, addDays } from 'date-fns';
import DragGhostBlock from '@/components/atoms/DragGhostBlock';
import type { IAppointment } from '@/types';

interface DragGhost {
    date: Date;
    top: number;
    height: number;
    timeLabel: string;
}

interface WeeklyCalendarProps {
    appointments: IAppointment[];
    currentDate?: Date;
    onAppointmentClick?: (appointment: IAppointment) => void;
    onGridMouseDown?: (e: React.MouseEvent, date: Date) => void;
    onGridMouseMove?: (e: React.MouseEvent) => void;
    onGridMouseUp?: () => void;
    dragGhost?: DragGhost | null;
    isDragging?: boolean;
}

const HOUR_START = 8;
const HOUR_END = 21;
const HOUR_HEIGHT = 80; // px per hour
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

function getTopOffset(startTime: string): number {
    const date = new Date(startTime);
    const hour = date.getHours();
    const minute = date.getMinutes();
    return (hour - HOUR_START) * HOUR_HEIGHT + (minute / 60) * HOUR_HEIGHT;
}

function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function WeeklyCalendar({ appointments, currentDate = new Date(), onAppointmentClick, onGridMouseDown, onGridMouseMove, onGridMouseUp, dragGhost, isDragging }: WeeklyCalendarProps) {
    const { t } = useTranslation();
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const appointmentsByDay = (day: Date) =>
        appointments.filter((apt) => {
            const aptDate = new Date(apt.startTime);
            return (
                aptDate.getFullYear() === day.getFullYear() &&
                aptDate.getMonth() === day.getMonth() &&
                aptDate.getDate() === day.getDate()
            );
        });

    const totalHeight = (HOUR_END - HOUR_START) * HOUR_HEIGHT;

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[700px]">
                {/* Header row */}
                <div className="flex border-b">
                    <div className="w-14 shrink-0" />
                    {days.map((day) => (
                        <div key={day.toISOString()} className="flex-1 text-center py-2 text-sm font-medium text-gray-700 border-l">
                            <div>{format(day, 'EEE')}</div>
                            <div className="text-xs text-gray-500">{format(day, 'MMM d')}</div>
                        </div>
                    ))}
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

                    {/* Day columns */}
                    {days.map((day) => (
                        <div
                            key={day.toISOString()}
                            className={`flex-1 border-l relative ${isDragging ? 'select-none' : ''} ${onGridMouseDown ? 'cursor-crosshair' : ''}`}
                            style={{ height: totalHeight }}
                            onMouseDown={(e) => onGridMouseDown?.(e, day)}
                            onMouseMove={onGridMouseMove}
                            onMouseUp={onGridMouseUp}
                        >
                            {/* Hour lines */}
                            {HOURS.map((hour) => (
                                <div
                                    key={hour}
                                    className="absolute w-full border-t border-gray-100"
                                    style={{ top: (hour - HOUR_START) * HOUR_HEIGHT }}
                                />
                            ))}

                            {/* Drag ghost block */}
                            {dragGhost && isSameDay(dragGhost.date, day) && (
                                <DragGhostBlock top={dragGhost.top} height={dragGhost.height} timeLabel={dragGhost.timeLabel} />
                            )}

                            {/* Appointments */}
                            {appointmentsByDay(day).map((apt) => {
                                const top = getTopOffset(apt.startTime);
                                if (top < 0 || top > totalHeight) return null;
                                const colorClass = serviceColors[apt.serviceType] ?? 'bg-gray-100 border-gray-300 text-gray-800';
                                const opacityClass = statusOpacity[apt.status] ?? 'opacity-100';
                                const isCancelled = apt.status === 'cancelled';
                                return (
                                    <button
                                        key={apt._id}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={() => onAppointmentClick?.(apt)}
                                        className={`absolute left-0.5 right-0.5 border rounded text-xs p-1 text-left cursor-pointer hover:brightness-95 transition-all ${colorClass} ${opacityClass}`}
                                        style={{ top, height: HOUR_HEIGHT - 4 }}
                                    >
                                        <p className={`font-medium truncate ${isCancelled ? 'line-through' : ''}`}>
                                            {getClientName(apt.clientId)}
                                        </p>
                                        <p className="truncate text-[10px] opacity-75">
                                            {t(`appointments.service_types.${apt.serviceType}`)}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
