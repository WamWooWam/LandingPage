import { RenderableProps } from "preact"

interface StartHeaderButtonProps {
    primaryClass: string
    label: string
}

export default function HeaderButton(props: RenderableProps<StartHeaderButtonProps>) {
    return (
        <button class={"start-header-button " + props.primaryClass} aria-label={props.label}>
            {props.children}
        </button>
    )
}