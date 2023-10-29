import { useEffect, useRef, useState } from 'preact/hooks';

import { VNode } from 'preact'
import { pickImage } from '.';

type PickImageProps = {
    avif?: string;
    webp?: string;
    png: string;
    children: (value: string) => VNode<any>
}

const PickImage = (props: PickImageProps) => {
    const unmounted = useRef<boolean>(false);
    const [image, setImage] = useState<string>();
    useEffect(() => {
        unmounted.current = false;

        pickImage(props)
            .then((image) => {
                if (unmounted.current) return;
                setImage(image);
            })
            .catch(() => {
                if (unmounted.current) return;
                setImage(props.png);
            });

        return () => {
            unmounted.current = true;
        }
    });
    return image && props.children(image);
};

export default PickImage;