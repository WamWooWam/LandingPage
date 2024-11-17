interface CoreWindowMinimizeButtonProps {
    onClick: (e: MouseEvent) => void;
}

const CoreWindowMinimizeButton = (props: CoreWindowMinimizeButtonProps) => {
    return (
        <button class="core-window-minimise" onClick={props.onClick}>
            <svg
                viewBox="71 603 883 172"
                width="12px"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M70.75,774L70.75,602.5L953.25,602.5L953.25,774Z"
                    fill="#FFFFFF"
                    fill-opacity="1"
                />
            </svg>
        </button>
    );
};

export default CoreWindowMinimizeButton;
