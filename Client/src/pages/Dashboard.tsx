import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, UserCheck, TrendingUp } from 'lucide-react';
import { getAppointments } from '@/services/appointments';
import { getClients } from '@/services/clients';
import { fetchWorkers } from '@/services/workers';

export default function Dashboard() {
    const { t } = useTranslation();

    const { data: appointments = [] } = useQuery({ queryKey: ['appointments'], queryFn: getAppointments });
    const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: getClients });
    const { data: workers = [] } = useQuery({ queryKey: ['workers'], queryFn: fetchWorkers });

    const activeClients = clients.filter((c) => c.isActive).length;
    const activeWorkers = workers.filter((w) => w.isActive).length;

    const recentAppointments = [...appointments]
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 5);

    const serviceCount = appointments.reduce((acc, apt) => {
        acc[apt.serviceType] = (acc[apt.serviceType] ?? 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const total = appointments.length || 1;

    const stats = [
        { label: t('dashboard.total_appointments'), value: appointments.length, icon: Calendar, color: 'text-blue-600 bg-blue-50' },
        { label: t('dashboard.active_clients'), value: activeClients, icon: Users, color: 'text-green-600 bg-green-50' },
        { label: t('dashboard.staff_members'), value: activeWorkers, icon: UserCheck, color: 'text-purple-600 bg-purple-50' },
        { label: t('dashboard.revenue'), value: '—', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
    ];

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    function getClientName(clientId: unknown): string {
        if (typeof clientId === 'object' && clientId !== null && 'name' in clientId) {
            return (clientId as { name: string }).name;
        }
        return String(clientId);
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('navigation.dashboard')}</h1>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-xl border p-4 flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${color}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{label}</p>
                            <p className="text-2xl font-bold text-gray-900">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent appointments */}
                <div className="bg-white rounded-xl border p-4">
                    <h2 className="font-semibold text-gray-700 mb-3">{t('dashboard.recent_appointments')}</h2>
                    {recentAppointments.length === 0 ? (
                        <p className="text-sm text-gray-400">{t('common.no_data')}</p>
                    ) : (
                        <div className="space-y-2">
                            {recentAppointments.map((apt) => (
                                <div key={apt._id} className="flex items-center justify-between text-sm">
                                    <div>
                                        <p className="font-medium">{getClientName(apt.clientId)}</p>
                                        <p className="text-gray-500 text-xs">
                                            {new Date(apt.startTime).toLocaleString()}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[apt.status] ?? ''}`}>
                                        {t(`appointments.status.${apt.status}`)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick stats */}
                <div className="bg-white rounded-xl border p-4">
                    <h2 className="font-semibold text-gray-700 mb-3">{t('dashboard.service_breakdown')}</h2>
                    <div className="space-y-3">
                        {(['basic', 'premium', 'deluxe'] as const).map((type) => {
                            const count = serviceCount[type] ?? 0;
                            const pct = Math.round((count / total) * 100);
                            const barColors = { basic: 'bg-blue-400', premium: 'bg-purple-400', deluxe: 'bg-amber-400' };
                            return (
                                <div key={type}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">{t(`appointments.service_types.${type}`)}</span>
                                        <span className="text-gray-500">{pct}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${barColors[type]}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
