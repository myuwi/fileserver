import { useState, useRef } from 'react';

import { FSVideoPlayer } from './FSVideoPlayer';
import { useMouseMoving } from '../hooks/useMouseMoving';
import { useFullscreen } from '../hooks/useFullscreen';
import { FSAudioPlayer } from './FSAudioPlayerNew';
import { useMobile } from '../context/MobileProvider';

type Props = {
    viewerMedia: any;
    setViewerMedia: (media: any) => void
}

// TODO: PiP-Player
// TODO: Queue
const FSMediaViewer = ({ viewerMedia, setViewerMedia }: Props) => {
    const isMobile = useMobile();
    const mediaViewerRef = useRef<HTMLDivElement>(null);

    const [fullscreen, setFullscreen, toggleFullScreen] = useFullscreen(mediaViewerRef);

    const mouseMoving = useMouseMoving(mediaViewerRef);

    const [error, setError] = useState(false);
    const [immersed, setImmersed] = useState(false);
    const [pip, setPip] = useState(false);

    const onError = (err: any) => {
        setError(true);
    };

    const close = () => {
        // setPip(!pip)
        setViewerMedia(null);
    };

    const viewerComponents: any = {
        video: <FSVideoPlayer
            media={viewerMedia}
            onError={onError}
            onImmersedChange={setImmersed}
            mouseMoving={mouseMoving}
            toggleFullScreen={toggleFullScreen}
            fullscreen={fullscreen}
            close={close}
        />,
        image: <img
            src={'http://192.168.1.106:3000/api/file/' + viewerMedia.id}
            alt=''
        />,
        // audio: <audio src={'http://192.168.1.106:3000/api/file/' + viewerMedia.id} controls />
        audio: <FSAudioPlayer media={viewerMedia} />
    };

    const classes = pip ? 'fs-media-viewer pip' : 'fs-media-viewer';

    return (
        <div className={classes} ref={mediaViewerRef}>
            {(error && viewerMedia.type !== 'video') && (
                <div className="error">Unable to load media</div>
            )}

            {(!error || error && viewerMedia.type === 'video') && (
                <>
                    {viewerComponents[viewerMedia.type]}

                    {/* {isMobile && !fullscreen && !pip && (
                        <div className="media-queue">
                            <div className="queue-header">
                                <span>Queue</span>
                                <IconButton icon={mdiChevronDown} />
                            </div>
                            <div className="queue-items">
                                {[viewerMedia].map((e: any, i: number) => {
                                    const current = i === 0
                                    const itemClasses = current ? 'queue-item current' : 'queue-item'
                                    return (
                                        <div key={i} className={itemClasses}>
                                            <div className="title">{e.name}</div>
                                            <IconButton icon={mdiDragHorizontalVariant} />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )} */}
                </>
            )}
        </div >
    );
};

export { FSMediaViewer };
