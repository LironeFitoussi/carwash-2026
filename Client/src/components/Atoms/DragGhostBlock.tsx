interface DragGhostBlockProps {
    top: number;
    height: number;
    timeLabel: string;
}

export default function DragGhostBlock({ top, height, timeLabel }: DragGhostBlockProps) {
    return (
        <div
            className="absolute left-1 right-1 bg-blue-200/60 border-2 border-blue-400 border-dashed rounded text-xs font-medium flex items-center justify-center text-blue-700 pointer-events-none select-none z-10"
            style={{ top, height: Math.max(height, 20) }}
        >
            {height >= 30 && <span>{timeLabel}</span>}
        </div>
    );
}
