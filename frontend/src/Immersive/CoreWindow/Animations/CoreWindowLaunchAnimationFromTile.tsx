import {
    AnimationSlowed,
    EASE_APPLAUNCHDRIFT,
    EASE_APPLAUNCHFASTIN,
    EASE_APPLAUNCHROTATE,
    EASE_APPLAUNCHROTATEBOUNCE,
    EASE_APPLAUNCHSCALE,
    EASE_LINEAR,
} from './AnimationCommon';
import { Component, RefObject, createRef } from 'preact';
import { Position, Size } from '~/Util';

import AnimationEvent from '~/Animation/AnimationEvent';
import AnimationRunner from '~/Animation/AnimationRunner';
import CoreWindowRenderer from '../CoreWindowRenderer';
import Storyboard from '~/Animation/Storyboard';
import TileDefaultVisual from '~/Immersive/Start/Tiles/TileDefaultVisual';
import TileInfo from '~/Data/TileInfo';
import { TileSize } from 'shared/TileSize';
import TileVisual from '~/Data/TileVisual';
import TileVisualRenderer from '~/Immersive/Start/Tiles/TileVisualRenderer';
import { getTileSize } from '~/Immersive/Start/Tiles/TileUtils';
import { lightenDarkenColour2 } from 'shared/ColourUtils';

//
// Provides a two sided element presenting both a tile and CoreWindow, used when animating between the two
//
interface CoreWindowImposterProps {
    tile: TileInfo;
    windowId: string;
    visible: boolean;
    initialPosition: Position;
    initialSize: Size;
    targetPosition: Position;
    targetSize: Size;

    onAnimationComplete: () => void;
}

interface CoreWindowImposterState {
    initialX: number;
    initialY: number;
    targetX: number;
    targetY: number;
    initialScaleX: number;
    initialScaleY: number;
    isAnimating: boolean;
}

export default class CoreWindowLaunchAnimationFromTile extends Component<
    CoreWindowImposterProps,
    CoreWindowImposterState
> {
    rootRef: RefObject<HTMLDivElement> = null;

    constructor(props: CoreWindowImposterProps) {
        super(props);
        this.rootRef = createRef();

        const initialX =
            this.props.initialPosition.x -
            this.props.targetSize.width / 2 +
            this.props.initialSize.width / 2;
        const initialY =
            this.props.initialPosition.y -
            this.props.targetSize.height / 2 +
            this.props.initialSize.height / 2;
        const initialScaleX =
            this.props.initialSize.width / this.props.targetSize.width;
        const initialScaleY =
            this.props.initialSize.height / this.props.targetSize.height;

        const targetX = this.props.targetPosition.x;
        const targetY = this.props.targetPosition.y;
        this.state = {
            initialX: initialX,
            initialY: initialY,
            targetX: targetX,
            targetY: targetY,
            initialScaleX: initialScaleX,
            initialScaleY: initialScaleY,
            isAnimating: true,
        };
    }

    shouldComponentUpdate(
        nextProps: Readonly<CoreWindowImposterProps>,
        nextState: Readonly<CoreWindowImposterState>,
        nextContext: any,
    ): boolean {
        return nextState.isAnimating;
    }

    componentDidMount(): void {
        const animation = new Storyboard()
            .addLayer(
                'x',
                this.state.initialX,
                this.state.targetX,
                0.0,
                0.972,
                EASE_APPLAUNCHFASTIN,
            )
            .addLayer(
                'y',
                this.state.initialY,
                this.state.targetY,
                0.0,
                0.972,
                EASE_APPLAUNCHDRIFT,
            )
            .addLayer(
                'width',
                this.state.initialScaleX,
                1,
                0.0,
                0.947,
                EASE_APPLAUNCHSCALE,
            )
            .addLayer(
                'height',
                this.state.initialScaleY,
                1,
                0.0,
                0.947,
                EASE_APPLAUNCHSCALE,
            )
            .addLayer('angle', 0, 180, 0.0, 1, EASE_APPLAUNCHROTATE)
            .addLayer('flip', 0, 1, 0, 0.5, EASE_LINEAR)
            .createAnimation();

        const runner = new AnimationRunner(
            animation,
            (2 / 3) * (AnimationSlowed ? 20 : 1),
        );
        runner.addEventListener('tick', (e: AnimationEvent) => {
            const values = e.values;
            const transform = `perspective(4000px) translate3d(${values.x}px, ${values.y}px, 0px) scale(${values.width}, ${values.height}) rotate3d(0,1,0,${values.angle}deg)`;

            this.rootRef.current.style.transform = transform;
        });

        runner.addEventListener('complete', () => {
            this.setState({ isAnimating: false });
            this.props.onAnimationComplete();
        });

        runner.start();
    }

    render() {
        const tileSize = getTileSize(this.props.tile.size);
        let tileColour =
            this.props.tile.app.visualElements.backgroundColor ?? '#4617b4';
        let tileColourLight = lightenDarkenColour2(tileColour, 0.05);
        let frontStyle = {
            background: `linear-gradient(to right, ${tileColour}, ${tileColourLight})`,
        };
        let classList = ['tile-container', TileSize[this.props.tile.size]];
        if (this.props.tile.app.visualElements.foregroundText === 'light') {
            classList.push('text-light');
        }

        let tileBounds = getTileSize(this.props.tile.size);

        let style = {
            left: '0px',
            top: '0px',
            width: this.props.targetSize.width + 'px',
            height: this.props.targetSize.height + 'px',
            transform: `perspective(4000px) translate3d(${this.state.initialX}px, ${this.state.initialY}px, 0px) scale(${this.state.initialScaleX}, ${this.state.initialScaleY}) rotateY(0deg)`,
        };

        let tileStyle = {
            width: tileSize.width + 'px',
            height: tileSize.height + 'px',
            transform: `scale(${this.props.targetSize.width / tileBounds.width}, ${this.props.targetSize.height / tileBounds.height})`,
            transformOrigin: 'top left',
        };

        return (
            <div ref={this.rootRef} class="core-window-imposter" style={style}>
                <div class="front">
                    <div className={classList.join(' ')} style={tileStyle}>
                        <div class="tile" style={frontStyle}>
                            <TileVisualRenderer
                                app={this.props.tile.app}
                                size={this.props.tile.size}
                                visual={this.props.tile.visual}
                            />
                        </div>
                        <div
                            className="tile-border"
                            style={{
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}
                        />
                    </div>
                </div>
                <div class="back">
                    <div class="back-content">
                        <CoreWindowRenderer
                            id={this.props.windowId}
                            x={0}
                            y={0}
                            width={this.props.targetSize.width}
                            height={this.props.targetSize.height}
                            isLaunching={true}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
