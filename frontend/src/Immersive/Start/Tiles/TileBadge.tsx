export default function TileBadge(props: { isError: boolean }) {
    let classList = ["tile-badge"]

    if (props.isError) {
        classList.push("error");
    }

    return (
        <div className={classList.join(' ')}></div>
    )
}