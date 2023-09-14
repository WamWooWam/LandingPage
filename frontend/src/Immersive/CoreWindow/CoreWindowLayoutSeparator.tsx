interface CoreWindowLayoutSeparatorProps {
    x: number;
    y: number;
}

export default function CoreWindowLayoutSeparator(props: CoreWindowLayoutSeparatorProps) {
    return (
        <div class="core-window-layout-separator" style={{ top: props.y, left: props.x, height: '100vh' }} onClick={(e) => e.stopPropagation()}/>
    );
}
