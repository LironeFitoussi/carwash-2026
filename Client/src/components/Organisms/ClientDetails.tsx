import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getAppointmentsByClient } from '@/services/appointments';
import type { IClient } from '@/types';

interface ClientDetailsProps {
    client: IClient | null;
    onClose: () => void;
}

export default function ClientDetails({ client, onClose }: ClientDetailsProps) {
    const { t } = useTranslation();

    const { data: appointments = [] } = useQuery({
        queryKey: ['appointments', 'client', client?._id],
        queryFn: () => getAppointmentsByClient(client!._id),
        enabled: !!client,
    });

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    return (
        <Dialog open={!!client} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('clients.details.title')}</DialogTitle>
                </DialogHeader>

                {client && (
                    <div className="space-y-4">
                        {/* Client info */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="font-medium text-gray-500">{t('clients.form.name')}</span>
                                <p className="font-semibold">{client.name}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-500">{t('clients.form.car_type')}</span>
                                <p>{t(`clients.car_types.${client.carType}`)}</p>
                            </div>
                            {client.phone && (
                                <div>
                                    <span className="font-medium text-gray-500">{t('clients.form.phone')}</span>
                                    <p>{client.phone}</p>
                                </div>
                            )}
                            {client.notes && (
                                <div className="col-span-2">
                                    <span className="font-medium text-gray-500">{t('clients.form.notes')}</span>
                                    <p>{client.notes}</p>
                                </div>
                            )}
                            <div>
                                <span className="font-medium text-gray-500">{t('clients.form.active')}</span>
                                <p>{client.isActive ? t('common.yes') : t('common.no')}</p>
                            </div>
                        </div>

                        {/* Appointment history */}
                        <div>
                            <h3 className="font-medium text-gray-700 mb-2">{t('clients.details.appointments')}</h3>
                            {appointments.length === 0 ? (
                                <p className="text-sm text-gray-500">{t('clients.details.no_appointments')}</p>
                            ) : (
                                <div className="space-y-2">
                                    {appointments.map((apt) => (
                                        <div key={apt._id} className="flex items-center justify-between border rounded-md px-3 py-2 text-sm">
                                            <div>
                                                <p className="font-medium">{format(new Date(apt.startTime), 'PPp')}</p>
                                                <p className="text-gray-500">{t(`appointments.service_types.${apt.serviceType}`)}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[apt.status] ?? ''}`}>
                                                {t(`appointments.status.${apt.status}`)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>{t('common.close')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
