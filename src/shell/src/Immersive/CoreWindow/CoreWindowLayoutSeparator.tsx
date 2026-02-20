import CoreWindowLayoutManager from "~/Data/CoreWindowLayoutManager";

interface CoreWindowLayoutSeparatorProps {
    x: number;
    y: number;
}

export default function CoreWindowLayoutSeparator(props: CoreWindowLayoutSeparatorProps) {
    let isDragging = false; // << not state because it doesn't affect render
    let startX = 0; // << ditto

    const handleMouseDown = (e: MouseEvent) => {
        e.stopPropagation();

        isDragging = true;
        startX = e.clientX;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        const delta = e.clientX - startX;
        const totalWidth = window.innerWidth - 22; 
        const newLeftWidth = props.x + delta;
        const newRatio = newLeftWidth / totalWidth;

        CoreWindowLayoutManager.getInstance()
            .setSplitRatio(newRatio);
    };

    const handleMouseUp = () => {
        isDragging = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    return (
        <div
            class="core-window-layout-separator"
            style={{ top: props.y, left: props.x, height: '100vh' }}
            onMouseDown={handleMouseDown}
            onClick={(e) => e.stopPropagation()}
        />
    );
}
