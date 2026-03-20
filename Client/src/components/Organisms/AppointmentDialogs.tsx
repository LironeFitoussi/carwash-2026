import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { CheckCircle, CircleCheck, XCircle, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AppointmentForm from './AppointmentForm';
import { utcToDatetimeLocal } from '@/lib/utils';
import type { IAppointment, AppointmentStatus, CreateAppointmentInput } from '@/types';

interface AppointmentDialogsProps {
    editAppointment: IAppointment | null;
    deleteAppointment: IAppointment | null;
    detailsAppointment: IAppointment | null;
    onEditClose: () => void;
    onDeleteClose: () => void;
    onDetailsClose: () => void;
    onEditSubmit: (data: CreateAppointmentInput) => void;
    onDeleteConfirm: () => void;
    onStatusChange?: (id: string, status: AppointmentStatus) => void;
    onEditFromDetails?: (appointment: IAppointment) => void;
    onDeleteFromDetails?: (appointment: IAppointment) => void;
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
    onStatusChange,
    onEditFromDetails,
    onDeleteFromDetails,
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
                                startTime: utcToDatetimeLocal(editAppointment.startTime),
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
                    {/* Quick Actions */}
                    {detailsAppointment && onStatusChange && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t">
                            {detailsAppointment.status !== 'confirmed' && detailsAppointment.status !== 'completed' && detailsAppointment.status !== 'cancelled' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                    onClick={() => { onStatusChange(detailsAppointment._id, 'confirmed'); onDetailsClose(); }}
                                >
                                    <CheckCircle className="w-4 h-4 me-1" />
                                    {t('appointments.actions.confirm')}
                                </Button>
                            )}
                            {detailsAppointment.status !== 'completed' && detailsAppointment.status !== 'cancelled' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                    onClick={() => { onStatusChange(detailsAppointment._id, 'completed'); onDetailsClose(); }}
                                >
                                    <CircleCheck className="w-4 h-4 me-1" />
                                    {t('appointments.actions.complete')}
                                </Button>
                            )}
                            {detailsAppointment.status !== 'cancelled' && detailsAppointment.status !== 'completed' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => { onStatusChange(detailsAppointment._id, 'cancelled'); onDetailsClose(); }}
                                >
                                    <XCircle className="w-4 h-4 me-1" />
                                    {t('appointments.actions.cancel')}
                                </Button>
                            )}
                            {onEditFromDetails && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => { onEditFromDetails(detailsAppointment); onDetailsClose(); }}
                                >
                                    <Pencil className="w-4 h-4 me-1" />
                                    {t('common.edit')}
                                </Button>
                            )}
                            {onDeleteFromDetails && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => { onDeleteFromDetails(detailsAppointment); onDetailsClose(); }}
                                >
                                    <Trash2 className="w-4 h-4 me-1" />
                                    {t('common.delete')}
                                </Button>
                            )}
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
