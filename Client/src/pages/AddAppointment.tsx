import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import AppointmentForm from '@/components/organisms/AppointmentForm';
import ClientForm from '@/components/organisms/ClientForm';
import { createAppointment, checkDuplicateAppointment } from '@/services/appointments';
import { createClient } from '@/services/clients';
import { datetimeLocalToUTC } from '@/lib/utils';
import type { CreateAppointmentInput, CreateClientInput, IAppointment } from '@/types';

export default function AddAppointment() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing');
    const [newClientData, setNewClientData] = useState<CreateClientInput | null>(null);
    const [conflictDialog, setConflictDialog] = useState<{ conflicts: IAppointment[] } | null>(null);
    const [duplicateDialog, setDuplicateDialog] = useState<{ appointments: IAppointment[]; pendingData: CreateAppointmentInput } | null>(null);

    const mutation = useMutation({
        mutationFn: createAppointment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast.success(t('appointments.form.created'));
            navigate('/appointments');
        },
        onError: (error: unknown) => {
            const err = error as { response?: { status?: number; data?: { conflicts?: IAppointment[] } } };
            if (err.response?.status === 409 && err.response.data?.conflicts) {
                setConflictDialog({ conflicts: err.response.data.conflicts });
            } else {
                toast.error(t('common.error'));
            }
        },
    });

    const resolveClientId = async (data: CreateAppointmentInput): Promise<string | null> => {
        let clientId = data.clientId;
        if (clientMode === 'new' && newClientData) {
            try {
                const created = await createClient(newClientData);
                clientId = created._id;
                queryClient.invalidateQueries({ queryKey: ['clients'] });
            } catch {
                toast.error(t('clients.create_error'));
                return null;
            }
        }
        return clientId;
    };

    const handleSubmit = async (data: CreateAppointmentInput) => {
        const clientId = await resolveClientId(data);
        if (!clientId) return;

        const finalData = { ...data, clientId, startTime: datetimeLocalToUTC(data.startTime) };

        try {
            const result = await checkDuplicateAppointment(clientId);
            if (result.hasActiveAppointments) {
                setDuplicateDialog({ appointments: result.appointments, pendingData: finalData });
                return;
            }
        } catch {
            // If check fails, proceed anyway
        }

        mutation.mutate(finalData);
    };

    const handleDuplicateBypass = () => {
        if (duplicateDialog) {
            mutation.mutate(duplicateDialog.pendingData);
            setDuplicateDialog(null);
        }
    };

    function getClientName(clientId: IAppointment['clientId']): string {
        if (typeof clientId === 'object' && clientId !== null) return clientId.name;
        return String(clientId);
    }

    return (
        <div className="max-w-lg mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">{t('appointments.table.add')}</h1>

            {/* Client mode toggle */}
            <div className="flex gap-2">
                <Button
                    variant={clientMode === 'existing' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setClientMode('existing')}
                >
                    {t('appointments.form.existing_client')}
                </Button>
                <Button
                    variant={clientMode === 'new' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setClientMode('new')}
                >
                    {t('appointments.form.new_client')}
                </Button>
            </div>

            {/* New client inline form */}
            {clientMode === 'new' && (
                <div className="border rounded-xl p-4 bg-gray-50">
                    <h2 className="font-medium text-gray-700 mb-3">{t('clients.form.title')}</h2>
                    <ClientForm
                        hideSubmitButton
                        onSubmit={(data) => setNewClientData(data)}
                    />
                    {newClientData && (
                        <p className="text-sm text-green-600 mt-2">
                            ✓ {newClientData.name}
                        </p>
                    )}
                </div>
            )}

            {/* Appointment form */}
            <div className="bg-white rounded-xl border p-4">
                <AppointmentForm
                    onSubmit={handleSubmit}
                    isLoading={mutation.isPending}
                />
            </div>

            {/* Conflict dialog */}
            <Dialog open={!!conflictDialog} onOpenChange={(open) => !open && setConflictDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('appointments.conflict.title')}</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">{t('appointments.conflict.description')}</p>
                    {conflictDialog && (
                        <div className="space-y-2 mt-2">
                            {conflictDialog.conflicts.map((c) => (
                                <div key={c._id} className="text-sm border rounded px-3 py-2">
                                    <p className="font-medium">{getClientName(c.clientId)}</p>
                                    <p className="text-gray-500">{new Date(c.startTime).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConflictDialog(null)}>{t('common.close')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Duplicate appointment warning dialog */}
            <Dialog open={!!duplicateDialog} onOpenChange={(open) => !open && setDuplicateDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('appointments.duplicate.title')}</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">{t('appointments.duplicate.description')}</p>
                    {duplicateDialog && (
                        <div className="space-y-2 mt-2">
                            {duplicateDialog.appointments.map((a) => (
                                <div key={a._id} className="text-sm border rounded px-3 py-2">
                                    <p className="font-medium">{getClientName(a.clientId)}</p>
                                    <p className="text-gray-500">
                                        {new Date(a.startTime).toLocaleString()} — {t(`appointments.status.${a.status}`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDuplicateDialog(null)}>{t('common.cancel')}</Button>
                        <Button onClick={handleDuplicateBypass}>{t('appointments.duplicate.proceed')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
