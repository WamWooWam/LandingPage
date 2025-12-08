import { RenderableProps } from "preact"
import { memo } from "preact/compat";

interface StartHeaderButtonProps {
    primaryClass: string
    label: string
}

const HeaderButton = memo((props: RenderableProps<StartHeaderButtonProps>) => (
    <button class={"start-header-button " + props.primaryClass} aria-label={props.label}>
        {props.children}
    </button>
));

export default HeaderButton;