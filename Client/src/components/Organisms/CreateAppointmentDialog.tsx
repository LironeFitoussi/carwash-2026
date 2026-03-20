import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppointmentForm from '@/components/organisms/AppointmentForm';
import type { CreateAppointmentInput } from '@/types';

interface CreateAppointmentDialogProps {
    open: boolean;
    initialStartTime: string;
    onClose: () => void;
    onSubmit: (data: CreateAppointmentInput) => void;
    isLoading?: boolean;
}

export default function CreateAppointmentDialog({ open, initialStartTime, onClose, onSubmit, isLoading }: CreateAppointmentDialogProps) {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('appointments.table.add')}</DialogTitle>
                </DialogHeader>
                <AppointmentForm
                    key={initialStartTime}
                    initialData={{ startTime: initialStartTime }}
                    onSubmit={onSubmit}
                    isLoading={isLoading}
                />
            </DialogContent>
        </Dialog>
    );
}
