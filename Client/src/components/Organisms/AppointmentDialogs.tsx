import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AppointmentForm from './AppointmentForm';
import type { IAppointment, CreateAppointmentInput } from '@/types';

interface AppointmentDialogsProps {
    editAppointment: IAppointment | null;
    deleteAppointment: IAppointment | null;
    detailsAppointment: IAppointment | null;
    onEditClose: () => void;
    onDeleteClose: () => void;
    onDetailsClose: () => void;
    onEditSubmit: (data: CreateAppointmentInput) => void;
    onDeleteConfirm: () => void;
    isEditLoading?: boolean;
    isDeleteLoading?: boolean;
}

function getClientName(clientId: IAppointment['clientId']): string {
    if (typeof clientId === 'string') return clientId;
    return clientId.name;
}

function getWorkerName(workerId: IAppointment['workerId']): string {
    if (typeof workerId === 'string') return workerId;
    return workerId.name;
}

function getClientId(clientId: IAppointment['clientId']): string {
    if (typeof clientId === 'string') return clientId;
    return clientId._id;
}

function getWorkerId(workerId: IAppointment['workerId']): string {
    if (typeof workerId === 'string') return workerId;
    return workerId._id;
}

export default function AppointmentDialogs({
    editAppointment,
    deleteAppointment,
    detailsAppointment,
    onEditClose,
    onDeleteClose,
    onDetailsClose,
    onEditSubmit,
    onDeleteConfirm,
    isEditLoading,
    isDeleteLoading,
}: AppointmentDialogsProps) {
    const { t } = useTranslation();

    return (
        <>
            {/* Edit Dialog */}
            <Dialog open={!!editAppointment} onOpenChange={(open) => !open && onEditClose()}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('appointments.edit.title')}</DialogTitle>
                    </DialogHeader>
                    {editAppointment && (
                        <AppointmentForm
                            initialData={{
                                clientId: getClientId(editAppointment.clientId),
                                workerId: getWorkerId(editAppointment.workerId),
                                serviceType: editAppointment.serviceType,
                                startTime: editAppointment.startTime.slice(0, 16),
                                status: editAppointment.status,
                                notes: editAppointment.notes,
                                isPickedUp: editAppointment.isPickedUp,
                                pickupLocation: editAppointment.pickupLocation,
                                vehicleType: editAppointment.vehicleType,
                            }}
                            onSubmit={onEditSubmit}
                            isLoading={isEditLoading}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteAppointment} onOpenChange={(open) => !open && onDeleteClose()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('appointments.delete.title')}</DialogTitle>
                    </DialogHeader>
                    {deleteAppointment && (
                        <p className="text-sm text-gray-600">
                            {t('appointments.delete.confirm', {
                                client: getClientName(deleteAppointment.clientId),
                                time: format(new Date(deleteAppointment.startTime), 'PPp'),
                            })}
                        </p>
                    )}
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={onDeleteClose}>
                            {t('common.cancel')}
                        </Button>
                        <Button variant="destructive" onClick={onDeleteConfirm} disabled={isDeleteLoading}>
                            {isDeleteLoading ? t('common.deleting') : t('common.delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details Dialog */}
            <Dialog open={!!detailsAppointment} onOpenChange={(open) => !open && onDetailsClose()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('appointments.details.title')}</DialogTitle>
                    </DialogHeader>
                    {detailsAppointment && (
                        <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="font-medium text-gray-500">{t('appointments.table.client')}</span>
                                    <p>{getClientName(detailsAppointment.clientId)}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-500">{t('appointments.table.worker')}</span>
                                    <p>{getWorkerName(detailsAppointment.workerId)}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-500">{t('appointments.table.start_time')}</span>
                                    <p>{format(new Date(detailsAppointment.startTime), 'PPp')}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-500">{t('appointments.table.service_type')}</span>
                                    <p>{t(`appointments.service_types.${detailsAppointment.serviceType}`)}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-500">{t('appointments.table.status')}</span>
                                    <p>{t(`appointments.status.${detailsAppointment.status}`)}</p>
                                </div>
                                {detailsAppointment.vehicleType && (
                                    <div>
                                        <span className="font-medium text-gray-500">{t('appointments.table.vehicle_type')}</span>
                                        <p>{t(`appointments.vehicle_types.${detailsAppointment.vehicleType}`)}</p>
                                    </div>
                                )}
                                {detailsAppointment.isPickedUp && (
                                    <div className="col-span-2">
                                        <span className="font-medium text-gray-500">{t('appointments.pickup.label')}</span>
                                        <p>{detailsAppointment.pickupLocation || '—'}</p>
                                    </div>
                                )}
                                {detailsAppointment.notes && (
                                    <div className="col-span-2">
                                        <span className="font-medium text-gray-500">{t('appointments.form.notes')}</span>
                                        <p>{detailsAppointment.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={onDetailsClose}>{t('common.close')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
