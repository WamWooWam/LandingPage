interface CoreWindowCloseButtonProps {
    onClick: (e: MouseEvent) => void;
}

const CoreWindowCloseButton = (props: CoreWindowCloseButtonProps) => {
    return (
        <button class="core-window-close" onClick={props.onClick}>
            <svg viewBox="105 282 815 815" width="12px" xmlns="http://www.w3.org/2000/svg">
                <path d="M104.25,975L390.25,689L104.25,403L225.25,281.5L511.25,567.5L797.75,281.5L919.25,402.5L632.75,689L919.25,975.5L797.75,1096.5L511.25,810.5L225.25,1096.5Z" fill="#FFFFFF" fill-opacity="1" />
            </svg>
        </button>
    );
}

export default CoreWindowCloseButton;