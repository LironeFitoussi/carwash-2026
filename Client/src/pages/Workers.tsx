import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Plus, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchWorkers, deleteWorker } from '@/services/workers';
import type { IWorker } from '@/types';

export default function Workers() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
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
        },
        onError: () => toast.error(t('common.error')),
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">{t('navigation.workers')}</h1>
                <Link to="/workers/new">
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        {t('workers.add')}
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12 text-gray-400">{t('common.loading')}</div>
            ) : (
                <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">{t('workers.form.name')}</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">{t('workers.form.phone')}</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {workers.map((worker) => (
                                <tr key={worker._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <UserCircle className="w-5 h-5 text-gray-400" />
                                            <p className="font-medium">{worker.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{worker.phone || '—'}</td>
                                    <td className="px-4 py-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                            onClick={() => setPendingDelete(worker)}
                                        >
                                            {t('common.delete')}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {workers.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                                        {t('common.no_data')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Delete confirmation */}
            {pendingDelete && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 space-y-4">
                        <h2 className="font-semibold text-gray-900">{t('workers.delete.title')}</h2>
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
                                {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
