import { Component } from 'preact';
import CoreWindow from '~/Data/CoreWindow';
import CoreWindowCloseButton from './CoreWindowCloseButton';
import CoreWindowMinimizeButton from './CoreWindowMinimizeButton';
import PackageImage from '~/Util/PackageImage';
import { Position } from '~/Util';
import { computed } from '@preact/signals';

interface CoreWindowTitleBarProps {
    window: CoreWindow;
    iconUrl: string;
    primaryColour: string;
    isVisible: boolean;

    onMinimiseClicked?: () => void;
    onCloseClicked?: () => void;
    onDragStart?: (e: PointerEvent) => void;
}

//
// Represents a CoreWindow's title bar
//
export default class CoreWindowTitleBar extends Component<CoreWindowTitleBarProps> {
    constructor(props: CoreWindowTitleBarProps) {
        super(props);

        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onMinimiseClicked = this.onMinimiseClicked.bind(this);
        this.onCloseClicked = this.onCloseClicked.bind(this);
    }

    onMinimiseClicked(e: MouseEvent) {
        e.stopPropagation();
        if (this.props.onMinimiseClicked) this.props.onMinimiseClicked();
    }

    onCloseClicked(e: MouseEvent) {
        e.stopPropagation();
        if (this.props.onCloseClicked) this.props.onCloseClicked();
    }

    // we need to handle pointer down events on the title bar so that we can initiate a window drag after a few pixels
    private pointerDownPosition: Position = null;

    onPointerDown(e: PointerEvent) {
        this.pointerDownPosition = { x: e.clientX, y: e.clientY };

        const target = e.target as HTMLElement;
        target.setPointerCapture(e.pointerId);
        target.addEventListener('pointermove', this.onPointerMove);
        target.addEventListener('pointerup', this.onPointerUp);
    }

    onPointerMove(e: PointerEvent) {
        if (this.pointerDownPosition) {
            const dy = e.clientY - this.pointerDownPosition.y;
            if (Math.abs(dy) > 5) {
                this.pointerDownPosition = null;
                e.target.removeEventListener('pointermove', this.onPointerMove);
                e.target.removeEventListener('pointerup', this.onPointerUp);

                if (this.props.onDragStart) this.props.onDragStart(e);
            }
        }
    }

    onPointerUp(e: PointerEvent) {
        this.pointerDownPosition = null;
        e.target.removeEventListener('pointermove', this.onPointerMove);
        e.target.removeEventListener('pointerup', this.onPointerUp);
    }

    render() {
        const computedTitle = computed(() =>
            this.props.window.signals.title.value === ''
                ? this.props.window.packageApplication.visualElements
                      .displayName
                : `${this.props.window.signals.title} - ${this.props.window.packageApplication.visualElements.displayName}`,
        );

        return (
            <div
                class={
                    'core-window-titlebar ' +
                    (!this.props.isVisible ? 'hidden' : '')
                }>
                <div
                    class="core-window-titlebar-content"
                    onPointerDown={this.onPointerDown}>
                    {/* TODO: icon has a context menu */}
                    <div
                        class="core-window-icon-container"
                        style={{ background: this.props.primaryColour }}>
                        <PackageImage url={this.props.iconUrl}>
                            {(image) => (
                                <img
                                    class="core-window-icon"
                                    src={image}
                                    alt={computed(
                                        () =>
                                            this.props.window.signals.title +
                                            ' icon',
                                    )}
                                />
                            )}
                        </PackageImage>
                    </div>

                    <div class="core-window-title">{computedTitle}</div>

                    <CoreWindowMinimizeButton
                        onClick={this.onMinimiseClicked}
                    />
                    <CoreWindowCloseButton onClick={this.onCloseClicked} />
                </div>
            </div>
        );
    }
}
