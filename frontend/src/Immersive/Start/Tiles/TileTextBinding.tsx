import { useLayoutEffect, useRef } from 'preact/hooks';

import TileElement from '~/Data/TileElement';

type TileTextBindingProps = {
    className: string;
    binding: TileElement;

    isBottomUp?: boolean;
};

export default function TileTextBinding(props: TileTextBindingProps) {
    if (props.isBottomUp) {
        // we need to absolutely position the text to the negative of its height
        // so that it can be bottom aligned

        const ref = useRef<HTMLSpanElement>();
        useLayoutEffect(() => {
            if (!ref.current) return;

            const height = ref.current.getBoundingClientRect().height;
            ref.current.style.top = `-${height}px`;
        }, [ref.current]);

        return (
            <div className={props.className} style={{ overflow: 'visible' }}>
                <span ref={ref} style={{ position: 'relative' }}>
                    {props.binding.content}
                </span>
            </div>
        );
    }

    return <span className={props.className}>{props.binding.content}</span>;
}
