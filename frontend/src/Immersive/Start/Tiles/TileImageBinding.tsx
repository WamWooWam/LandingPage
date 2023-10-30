import TileElement from "~/Data/TileElement";

type TileImageBindingProps = {
    className: string;
    binding: TileElement;
}

export default function TileImageBinding(props: TileImageBindingProps) {
    return <img className={props.className} src={props.binding.content} alt={props.binding.alt} />
} 