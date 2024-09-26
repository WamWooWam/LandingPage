import { Position, Size } from "../Util";

export default interface CoreWindowLayoutParams {
    id: string;
    size: Size,
    position: Position,
    visible: boolean,
}