import { useEffect } from 'react';

import { LOGGER } from '../LOGGER';
import { ViewerMedia } from '../types';

type Props = {
    media: ViewerMedia;
    onError?: (err: any) => void;
}

export const AudioPlayer = ({
    media,
    onError
}: Props) => {
    const src = 'http://192.168.1.106:3000/api/file/' + media.data.id;

    useEffect(() => {
        LOGGER.debug(`Loading audio with src: ${src}`);
    }, [src]);

    return (
        <div
            className="fixed bottom-8 right-4 bg-white shadow px-4 py-1.5 border border-secondary-100 rounded w-96"
        >
            <audio
                className="hidden"
                src={src}
            />

            <div>
                AUDIO
            </div>
        </div>
    );
};
