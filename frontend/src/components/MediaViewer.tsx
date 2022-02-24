import { useState, useRef } from 'react';

import { VideoPlayer } from './VideoPlayer';
import { useMouseMoving } from '../hooks/useMouseMoving';
import { useFullscreen } from '../hooks/useFullscreen';
import { AudioPlayer } from './AudioPlayer';
import { ViewerMedia } from '../types';
import { File } from '@backend-types';

type Props = {
    viewerMedia: File;
    setViewerMedia: React.Dispatch<React.SetStateAction<File | null>>;
};

// TODO: Queue
export const MediaViewer = ({ viewerMedia, setViewerMedia }: Props) => {
    const mediaViewerRef = useRef<HTMLDivElement>(null);

    const [fullscreen, setFullscreen, toggleFullScreen] = useFullscreen(mediaViewerRef);
    const [queueOpen, setQueueOpen] = useState(false);

    const [error, setError] = useState(false);

    const onError = (err: any) => {
        setError(true);
    };

    const close = () => {
        setViewerMedia(null);
    };

    const getViewerComponent = (media: File) => {
        switch (media.contentType) {
            case 'audio':
            case 'video':
                return (
                    <VideoPlayer
                        media={viewerMedia}
                        onError={onError}
                        toggleFullScreen={toggleFullScreen}
                        // openQueue={() => setQueueOpen(true)}
                        fullscreen={fullscreen}
                        close={close}
                    />
                );
            case 'image':
                return (
                    <img
                        className="max-w-full max-h-screen"
                        src={'http://192.168.1.106:3000/api/file/' + viewerMedia.id}
                        alt=""
                    />
                );
            default:
                return undefined;
        }
    };

    return (
        <div
            className="flex items-center flex-row flex-nowrap fixed inset-0 z-50 bg-black bg-opacity-80 overflow-hidden"
            ref={mediaViewerRef}
        >
            {error && viewerMedia.contentType !== 'video' && <div className="text-white">Unable to load media</div>}

            {viewerMedia.contentType &&
                (!error || (error && viewerMedia.contentType === 'video')) &&
                getViewerComponent(viewerMedia)}

            {queueOpen && <div className="flex flex-col w-96 bg-white bg-opacity-100 flex-none h-full"></div>}
        </div>
    );
};
