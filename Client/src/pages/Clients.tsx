import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Plus, MessageCircle, Phone, MessageSquare, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClientDetails from '@/components/organisms/ClientDetails';
import ClientForm from '@/components/organisms/ClientForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getClients, deleteClient, updateClient } from '@/services/clients';
import type { IClient, CreateClientInput } from '@/types';

export default function Clients() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [selectedClient, setSelectedClient] = useState<IClient | null>(null);
    const [editingClient, setEditingClient] = useState<IClient | null>(null);
    const [pendingDelete, setPendingDelete] = useState<IClient | null>(null);

    const { data: clients = [], isLoading } = useQuery({
        queryKey: ['clients'],
        queryFn: getClients,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast.success(t('clients.deleted'));
            setPendingDelete(null);
        },
        onError: () => toast.error(t('common.error')),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateClientInput> }) =>
            updateClient(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast.success(t('clients.updated'));
            setEditingClient(null);
        },
        onError: () => toast.error(t('common.error')),
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">{t('navigation.clients')}</h1>
                <Link to="/clients/new">
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        {t('clients.add')}
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12 text-gray-400">{t('common.loading')}</div>
            ) : (
                <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full text-sm table-fixed">
                        <colgroup>
                            <col className="w-1/3" />
                            <col className="w-1/4 hidden sm:table-column" />
                            <col className="w-1/4" />
                            <col className="w-1/4" />
                        </colgroup>
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-start px-4 py-3 font-medium text-gray-600">{t('clients.form.name')}</th>
                                <th className="text-start px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">{t('clients.form.car_type')}</th>
                                <th className="text-start px-4 py-3 font-medium text-gray-600">{t('clients.contact')}</th>
                                <th className="text-start px-4 py-3 font-medium text-gray-600">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {clients.map((client) => (
                                <tr key={client._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <button
                                            type="button"
                                            className="font-medium text-blue-600 hover:underline text-left"
                                            onClick={() => setSelectedClient(client)}
                                        >
                                            {client.name}
                                        </button>
                                        {!client.isActive && (
                                            <span className="ml-2 text-xs text-gray-400">({t('clients.inactive')})</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                                        {t(`clients.car_types.${client.carType}`)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {client.phone && (
                                                <>
                                                    <a href={`tel:${client.phone}`} className="text-gray-500 hover:text-blue-600" title={t('clients.call')}>
                                                        <Phone className="w-4 h-4" />
                                                    </a>
                                                    <a href={`sms:${client.phone}`} className="text-gray-500 hover:text-green-600" title={t('clients.sms')}>
                                                        <MessageSquare className="w-4 h-4" />
                                                    </a>
                                                    <a href={`https://wa.me/${client.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-500" title={t('clients.whatsapp')}>
                                                        <MessageCircle className="w-4 h-4" />
                                                    </a>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-xs"
                                                onClick={() => setEditingClient(client)}
                                            >
                                                <Pencil className="w-3 h-3 mr-1" />
                                                {t('common.edit')}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                                onClick={() => setPendingDelete(client)}
                                            >
                                                {t('common.delete')}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {clients.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                                        {t('common.no_data')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit dialog */}
            <Dialog open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{t('clients.edit')}</DialogTitle>
                    </DialogHeader>
                    {editingClient && (
                        <ClientForm
                            initialData={editingClient}
                            onSubmit={(data) => updateMutation.mutate({ id: editingClient._id, data })}
                            isLoading={updateMutation.isPending}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            {pendingDelete && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 space-y-4">
                        <h2 className="font-semibold text-gray-900">{t('clients.delete.title')}</h2>
                        <p className="text-sm text-gray-600">
                            {t('clients.delete.confirm', { name: pendingDelete.name })}
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
                                {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <ClientDetails client={selectedClient} onClose={() => setSelectedClient(null)} />
        </div>
    );
}
