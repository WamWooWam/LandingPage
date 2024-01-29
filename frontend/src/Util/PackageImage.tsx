import { useEffect, useRef, useState } from 'preact/hooks';

import { VNode } from 'preact'
import { pickImage } from '~/Util';

type PackageImageProps = {
    url: string;
    children: (value: string) => VNode<any>
}

const PackageImage = (props: PackageImageProps) => {
    const unmounted = useRef<boolean>(false);
    const [image, setImage] = useState<string>(null);

    useEffect(() => {
        if (!props.url.endsWith(".webp") && !props.url.endsWith(".avif")) {
            setImage(props.url);
            return;
        }

        unmounted.current = false;

        const png = props.url.replace(/\.webp|\.avif|\.png/, ".png");
        const webp = props.url.replace(/\.webp|\.avif|\.png/, ".webp");
        const avif = props.url.replace(/\.webp|\.avif|\.png/, ".avif");

        pickImage({ avif, webp, png })
            .then((image) => {
                if (unmounted.current) return;
                setImage(image);
            })
            .catch(() => {
                if (unmounted.current) return;
                setImage(props.url);
            });


        return () => {
            // TODO: for some reason this always gets called
            unmounted.current = true;
        }
    }, [props.url]);

    return <>
        {image ? props.children(image) : null}
    </>;
}

export default PackageImage;