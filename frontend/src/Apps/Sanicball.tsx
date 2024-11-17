import { AppInstance, CoreWindow } from './Shared';

import { render } from 'preact';

export default (instance: AppInstance, window: CoreWindow) => {
    return new Promise<void>((resolve, reject) => {
        const frame = (
            <iframe
                src="/ball/"
                allowFullScreen={true}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    position: 'absolute',
                    top: '0',
                    left: '0',
                }}
                onLoad={() => resolve()}
                onError={() => reject()}
            />
        );

        render(frame, window.view);
    });
};
