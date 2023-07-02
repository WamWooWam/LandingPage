import { Component, createRef, RefObject, } from "preact";
import { TileRenderer, TileProps } from "./TileRenderer";
import { TileSize } from "../../../shared/TileSize";
import { FenceTileRenderer, FenceTileProps } from "./FenceTileRenderer";
import { RawTileProps } from "../../../shared/StartLayoutParser";
import "./tile.css"

interface TileGroupProps {
    title: string;
    tiles: RawTileProps[];
}

type TilePropsWithType = (TileProps | FenceTileProps) & { type: "fence" | "tile", key: any };

interface TileGroupState {
    observer: ResizeObserver;
    collapsedTiles: TilePropsWithType[];
}

export class TileGroup extends Component<TileGroupProps, TileGroupState> {

    groupRef: RefObject<HTMLDivElement>
    headerRef: RefObject<HTMLDivElement>

    constructor(props: TileGroupProps) {
        super(props);

        this.groupRef = createRef();
        this.headerRef = createRef();
    }

    componentDidMount() {
        let startTilesElement = this.groupRef.current.parentElement;
        let headerText = this.headerRef.current;

        if (window.ResizeObserver) {
            console.log("ResizeObserver supported!");
            let resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    if (entry.target === startTilesElement) {
                        let availableHeight = startTilesElement.offsetHeight - headerText.offsetHeight;
                        let tiles = this.calculateLayout(this.props.tiles, availableHeight);
                        this.setState({ collapsedTiles: tiles });
                    }
                }
            });

            resizeObserver.observe(startTilesElement);
            this.setState({ observer: resizeObserver });
        }
        else {
            // fallback to window resize event
            window.addEventListener("resize", this.onResize.bind(this));
        }

        let availableHeight = startTilesElement.offsetHeight - headerText.offsetHeight;
        let tiles = this.calculateLayout(this.props.tiles, availableHeight);

        console.log("Tiles: ", tiles);
        this.setState({ collapsedTiles: tiles });
    }

    private onResize() {
        let startTilesElement = this.groupRef.current.parentElement;
        let headerText = this.headerRef.current;
        let availableHeight = startTilesElement.offsetHeight - headerText.offsetHeight;
        let tiles = this.calculateLayout(this.props.tiles, availableHeight);
        console.log("Tiles: ", tiles);
        this.setState({ collapsedTiles: tiles });
    }

    componentWillUnmount() {
        if (this.state.observer) {
            this.state.observer.disconnect();
        }
        else {
            window.removeEventListener("resize", this.onResize.bind(this));
        }
    }

    render() {
        return (
            <div class="start-tile-group" ref={this.groupRef}>
                <div class="tile-group-header" ref={this.headerRef}>
                    <div class="tile-group-header-text">
                        {/* a non breaking space is inserted here to ensure the layout remains the same */}
                        {this.props.title && this.props.title !== "" ? this.props.title : "\u00A0"}
                    </div>
                </div>

                {this.state.collapsedTiles ?
                    <div class="tile-group-tiles">
                        {...this.state.collapsedTiles.map(t => t.type === "fence" ? <FenceTileRenderer {...t as FenceTileProps} /> : <TileRenderer {...t as TileProps} />)}
                    </div>
                    : null}
            </div>
        )
    }

    // todo: a lot of this should be adapted to use the shared code 
    private tileSizeToWidth(size: TileSize): number {
        switch (size) {
            case TileSize.square150x150:
                return 1;
            case TileSize.wide310x150:
            case TileSize.square310x310:
                return 2;
            case TileSize.square70x70: // handled separately
            default:
                throw new Error("Invalid tile size!")
        }
    }

    private tileSizeToHeight(size: TileSize): number {
        switch (size) {
            case TileSize.square150x150:
            case TileSize.wide310x150:
                return 1;
            case TileSize.square310x310:
                return 2;
            case TileSize.square70x70: // handled separately
            default:
                throw new Error("Invalid tile size!")
        }
    }

    private collapseTiles(tiles: RawTileProps[]): Array<TilePropsWithType> {
        let fullTiles: TilePropsWithType[] = [];
        let currentFence: Array<TileProps> = null;
        let resetFence = (val: [] = null) => {
            if (currentFence && currentFence.length) {
                fullTiles.push({
                    size: TileSize.square150x150,
                    apps: currentFence,
                    type: "fence",
                    key: `${currentFence[0].packageName}!${currentFence[0].appId}`
                });
            }
            
            currentFence = val;
        }

        for (const tile of tiles) {
            if (tile.fence && tile.size === TileSize.square70x70) {
                resetFence([]);
                currentFence.push(tile);
                continue;
            }

            if (currentFence) {
                if (tile.size !== TileSize.square70x70) {
                    resetFence();
                }
                else {
                    if (currentFence.length === 4) {
                        resetFence([]);
                    }

                    currentFence.push(tile);
                    continue;
                }
            }

            fullTiles.push({ type: 'tile', key: `${tile.packageName}!${tile.appId}`, ...tile });
        }

        resetFence([]);

        // console.log("collaped tiles");

        return fullTiles;
    }

    private calculateLayout(tiles: RawTileProps[], availableHeight: number): Array<TilePropsWithType> {
        let collapsedTiles = this.collapseTiles(tiles);

        // if the window is below 600px wide, we use the mobile layout
        if (window.matchMedia("(max-width: 600px)").matches) {
            return collapsedTiles;
        }
        else {
            // console.log("using desktop layout");
            return this.layoutDesktop(collapsedTiles, availableHeight);
        }
    }

    private layoutDesktop(collapsedTiles: any[], availableHeight: number): Array<TilePropsWithType> {
        let maxRows = Math.floor(availableHeight / 128);
        // console.log(`available height: ${availableHeight}, maxRows: ${maxRows}`);
        let row = 0;
        let column = 0;
        let baseColumn = 0;

        let lastWidth = 0;
        let lastHeight = 0;
        let tiles: TilePropsWithType[] = [];

        for (const tile of collapsedTiles) {
            let tileWidth = this.tileSizeToWidth(tile.size);
            let tileHeight = this.tileSizeToHeight(tile.size);

            if ((column - baseColumn) >= 2) {
                if ((row + Math.max(lastHeight, tileHeight)) >= maxRows) {
                    row = 0;
                    baseColumn += 2;
                }
                else {
                    row += lastHeight;
                }

                column = baseColumn;
            }


            if (tile.type === 'fence') {
                tiles.push({ row, column, ...tile });
            }
            else {
                tiles.push({ row, column, ...tile });
            }

            column += tileWidth;
            lastWidth = tileWidth;
            lastHeight = tileHeight;
        }

        return tiles;
    }
}