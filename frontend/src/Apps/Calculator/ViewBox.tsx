import { useLayoutEffect, useRef, useState } from "preact/hooks";

import { RenderableProps } from "preact";

// implementation of a XAML ViewBox
export default function ViewBox(props: RenderableProps<{}>) {
    const ref = useRef<HTMLDivElement>();
    const [scale, setScale] = useState(1);

    useLayoutEffect(() => {
        const onSizeChanged = (entries: ResizeObserverEntry[]) => {
            if (!ref.current) return;
            for (const entry of entries) {
                if (entry.target === ref.current.parentElement) {

                    // scale up to fit the parent container
                    let parent = ref.current.parentElement;
                    let scale = Math.min(parent.clientWidth / ref.current.clientWidth, parent.clientHeight / ref.current.clientHeight);
                    setScale(scale);

                    console.log(`ViewBox: scale=${scale}`);
                }
            }
        }

        const observer = new ResizeObserver(onSizeChanged);
        observer.observe(ref.current.parentElement);

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} class="view-box" style={{ transform: `scale(${scale})` }}>
            {props.children}
        </div>
    );
}