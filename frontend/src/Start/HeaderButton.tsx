import { RenderableProps } from "preact"

interface StartHeaderButtonProps {
    primaryClass: string
    label: string
}

const HeaderButton = (props: RenderableProps<StartHeaderButtonProps>) => {
    return (
        <button class={"start-header-button " + props.primaryClass} aria-label={props.label}>
            {props.children}
        </button>
    )
}

export default HeaderButton;