import { RenderableProps, createContext } from 'preact';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';

interface VisualState {
    maxWidth: number;
    className: string;
}

interface VisualStateManagerProps {
    visualStates: VisualState[];
}

export const VisualStateContext = createContext<VisualState>(null);

export function VisualStateManager(
    props: RenderableProps<VisualStateManagerProps>,
) {
    const ref = useRef<HTMLDivElement>();
    const [currentState, setCurrentState] = useState<VisualState>(
        props.visualStates[0],
    );
    const calculateState = (width: number) => {
        let state = props.visualStates[0];
        for (let i = 0; i < props.visualStates.length; i++) {
            if (props.visualStates[i].maxWidth >= width) {
                state = props.visualStates[i];
                break;
            }
        }

        return state;
    };

    useLayoutEffect(() => {
        const onSizeChanged = (entries: ResizeObserverEntry[]) => {
            if (!ref.current) return;
            for (const entry of entries) {
                if (entry.target === ref.current) {
                    setCurrentState(calculateState(entry.contentRect.width));
                }
            }
        };

        const observer = new ResizeObserver(onSizeChanged);
        observer.observe(ref.current);

        return () => observer.disconnect();
    }, []);

    return (
        <VisualStateContext.Provider value={currentState}>
            <div
                ref={ref}
                class={`visual-state-manager ${currentState.className}`}>
                {props.children}
            </div>
        </VisualStateContext.Provider>
    );
}
