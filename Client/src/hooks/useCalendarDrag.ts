import { useState, useCallback, useRef, useEffect } from 'react';
import { format } from 'date-fns';

interface DragSelection {
    date: Date;
    startMinutes: number;
    endMinutes: number;
}

interface UseCalendarDragOptions {
    hourStart: number;
    hourEnd: number;
    hourHeight: number;
    snapMinutes?: number;
    onDragEnd?: (date: Date, startTimeStr: string) => void;
}

interface DragGhost {
    date: Date;
    top: number;
    height: number;
    timeLabel: string;
}

interface UseCalendarDragReturn {
    dragSelection: DragSelection | null;
    isDragging: boolean;
    handleMouseDown: (e: React.MouseEvent, columnDate: Date) => void;
    handleMouseMove: (e: React.MouseEvent) => void;
    handleMouseUp: () => void;
    clearSelection: () => void;
    dragGhost: DragGhost | null;
}

function snapTo(value: number, snap: number): number {
    return Math.round(value / snap) * snap;
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function minutesToTimeLabel(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getMinutesFromMouseY(
    clientY: number,
    columnRect: DOMRect,
    hourStart: number,
    hourEnd: number,
    hourHeight: number,
    snap: number,
): number {
    const offsetY = clientY - columnRect.top;
    const rawMinutes = (offsetY / hourHeight) * 60 + hourStart * 60;
    return clamp(snapTo(rawMinutes, snap), hourStart * 60, hourEnd * 60);
}

export function useCalendarDrag({
    hourStart,
    hourEnd,
    hourHeight,
    snapMinutes = 15,
    onDragEnd,
}: UseCalendarDragOptions): UseCalendarDragReturn {
    const [dragSelection, setDragSelection] = useState<DragSelection | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const columnRectRef = useRef<DOMRect | null>(null);
    const dragStartRef = useRef<{ date: Date; startMinutes: number } | null>(null);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent, columnDate: Date) => {
            // Only left click
            if (e.button !== 0) return;

            const column = e.currentTarget as HTMLElement;
            const rect = column.getBoundingClientRect();
            columnRectRef.current = rect;

            const minutes = getMinutesFromMouseY(e.clientY, rect, hourStart, hourEnd, hourHeight, snapMinutes);

            dragStartRef.current = { date: columnDate, startMinutes: minutes };
            setDragSelection({ date: columnDate, startMinutes: minutes, endMinutes: minutes + snapMinutes });
            setIsDragging(true);
        },
        [hourStart, hourEnd, hourHeight, snapMinutes],
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!isDragging || !dragStartRef.current || !columnRectRef.current) return;

            const minutes = getMinutesFromMouseY(
                e.clientY,
                columnRectRef.current,
                hourStart,
                hourEnd,
                hourHeight,
                snapMinutes,
            );

            const { startMinutes } = dragStartRef.current;
            const newStart = Math.min(startMinutes, minutes);
            const newEnd = Math.max(startMinutes, minutes);

            setDragSelection((prev) =>
                prev
                    ? {
                          ...prev,
                          startMinutes: newStart,
                          endMinutes: Math.max(newEnd, newStart + snapMinutes),
                      }
                    : null,
            );
        },
        [isDragging, hourStart, hourEnd, hourHeight, snapMinutes],
    );

    const finalizeDrag = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);

        setDragSelection((prev) => {
            if (!prev) return null;

            // Click without significant drag → default to 1-hour block
            let finalEnd = prev.endMinutes;
            if (finalEnd - prev.startMinutes <= snapMinutes) {
                finalEnd = Math.min(prev.startMinutes + 60, hourEnd * 60);
            }

            const updated = { ...prev, endMinutes: finalEnd };

            // Build datetime-local string for the start time
            const date = new Date(updated.date);
            const hours = Math.floor(updated.startMinutes / 60);
            const mins = updated.startMinutes % 60;
            date.setHours(hours, mins, 0, 0);
            const startTimeStr = format(date, "yyyy-MM-dd'T'HH:mm");

            onDragEnd?.(updated.date, startTimeStr);

            return updated;
        });
    }, [isDragging, snapMinutes, hourEnd, onDragEnd]);

    const handleMouseUp = useCallback(() => {
        finalizeDrag();
    }, [finalizeDrag]);

    // Global mouseup listener for when mouse is released outside the calendar
    useEffect(() => {
        if (!isDragging) return;

        const handleGlobalMouseUp = () => finalizeDrag();
        document.addEventListener('mouseup', handleGlobalMouseUp);
        return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [isDragging, finalizeDrag]);

    const clearSelection = useCallback(() => {
        setDragSelection(null);
        dragStartRef.current = null;
        columnRectRef.current = null;
    }, []);

    // Compute ghost block position
    const dragGhost: DragGhost | null = dragSelection
        ? {
              date: dragSelection.date,
              top: ((dragSelection.startMinutes - hourStart * 60) / 60) * hourHeight,
              height: ((dragSelection.endMinutes - dragSelection.startMinutes) / 60) * hourHeight,
              timeLabel: `${minutesToTimeLabel(dragSelection.startMinutes)} - ${minutesToTimeLabel(dragSelection.endMinutes)}`,
          }
        : null;

    return {
        dragSelection,
        isDragging,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        clearSelection,
        dragGhost,
    };
}
