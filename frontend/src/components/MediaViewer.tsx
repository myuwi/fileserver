import { useState, useRef } from 'react';

import { VideoPlayer } from './VideoPlayer';
import { useMouseMoving } from '../hooks/useMouseMoving';
import { useFullscreen } from '../hooks/useFullscreen';
import { AudioPlayer } from './AudioPlayer';
import { ViewerMedia } from '../types';

type Props = {
    viewerMedia: ViewerMedia;
    setViewerMedia: (media: any) => void
}

// TODO: Queue
export const MediaViewer = ({ viewerMedia, setViewerMedia }: Props) => {
    const mediaViewerRef = useRef<HTMLDivElement>(null);

    const [fullscreen, setFullscreen, toggleFullScreen] = useFullscreen(mediaViewerRef);

    const mouseMoving = useMouseMoving(mediaViewerRef);

    const [error, setError] = useState(false);
    const [immersed, setImmersed] = useState(false);

    const onError = (err: any) => {
        setError(true);
    };

    const close = () => {
        setViewerMedia(null);
    };

    const getViewerComponent = (media: ViewerMedia) => {
        switch (media.type) {
            case 'audio':
            case 'video':
                return <VideoPlayer
                    media={viewerMedia}
                    onError={onError}
                    onImmersedChange={setImmersed}
                    mouseMoving={mouseMoving}
                    toggleFullScreen={toggleFullScreen}
                    fullscreen={fullscreen}
                    close={close}
                />;
            case 'image':
                return <img
                    className="max-w-full max-h-screen"
                    src={'http://192.168.1.106:3000/api/file/' + viewerMedia.data.id}
                    alt=''
                />;
            default:
                return undefined;
        }
    };

    // const viewerComponents: any = {
    //     video: <VideoPlayer
    //         media={viewerMedia}
    //         onError={onError}
    //         onImmersedChange={setImmersed}
    //         mouseMoving={mouseMoving}
    //         toggleFullScreen={toggleFullScreen}
    //         fullscreen={fullscreen}
    //         close={close}
    //     />,
    //     image: <img
    //         className="max-w-full max-h-screen"
    //         src={'http://192.168.1.106:3000/api/file/' + viewerMedia.data.id}
    //         alt=''
    //     />
    // };

    return (
        <div
            className="flex items-center flex-col flex-nowrap fixed inset-0 z-50 bg-black bg-opacity-80 overflow-hidden"
            ref={mediaViewerRef}
        >
            {(error && viewerMedia.type !== 'video') && (
                <div
                    className="text-white"
                >Unable to load media</div>
            )}

            {viewerMedia.type && (!error || error && viewerMedia.type === 'video') && getViewerComponent(viewerMedia)}
        </div>
    );
};
