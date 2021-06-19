import { useEffect } from 'react';

import { LOGGER } from '../LOGGER';

type Props = {
    media: any;
    onError?: (err: any) => void;
}

const FSAudioPlayer = ({ media, onError, }: Props) => {
    const src = 'http://192.168.1.106:3000/api/file/' + media.id;

    useEffect(() => {
        LOGGER.debug(`Loading audio with src: ${src}`);
    }, [src]);

    return (
        <audio src={src} controls />
    );
};

export { FSAudioPlayer };
