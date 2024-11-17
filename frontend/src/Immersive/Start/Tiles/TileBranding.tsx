import { ApplicationVisualElements } from 'shared/ApplicationVisualElements';
import PackageImage from '~/Util/PackageImage';
import { TileSize } from 'shared/TileSize';

interface TileBrandingProps {
    branding: string;
    nextBranding?: string;
    previousBranding?: string;
    size: TileSize;
    visualElements: ApplicationVisualElements;
}

export function TileBranding({
    branding,
    nextBranding,
    previousBranding,
    size,
    visualElements,
}: TileBrandingProps) {
    const className =
        'tile-toast-footer' +
        (nextBranding && branding != nextBranding ? ' hidden' : '') +
        (previousBranding && branding != previousBranding ? ' new' : '');
    const showTextSizes = visualElements.defaultTile.showNameOnTiles.map(
        (v) => TileSize[v as keyof typeof TileSize],
    );

    switch (branding) {
        case 'none':
            return null;
        case 'name':
            return (
                showTextSizes.includes(size) && (
                    <div className={className}>
                        <p
                            className={
                                'tile-front-text' +
                                (visualElements.foregroundText == 'dark'
                                    ? ' black'
                                    : '')
                            }>
                            {visualElements.displayName}
                        </p>
                    </div>
                )
            );
        case 'logo':
            return (
                <div className={className}>
                    <PackageImage url={visualElements.square30x30Logo}>
                        {(image) => (
                            <img
                                className="tile-badge-icon"
                                src={image}
                                alt={''}
                            />
                        )}
                    </PackageImage>
                </div>
            );
    }
}
