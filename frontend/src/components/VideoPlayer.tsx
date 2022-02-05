import * as React from 'react';
import { useEffect, useMemo, useState, useRef } from 'react';

import { Icon } from './Icon';
import { mdiPause, mdiPlay, mdiFullscreen, mdiFullscreenExit, mdiFastForward10, mdiRewind10, mdiArrowLeft, mdiDotsVertical, mdiLinkVariant, mdiDownload, mdiVolumeHigh, mdiPictureInPictureBottomRight } from '@mdi/js';

import { useDrag } from '../hooks/useDrag';

import { useMobile } from '../context/MobileProvider';
import { Spinner } from './Spinner';

import { IconButton } from './IconButton';
import { LOGGER } from '../LOGGER';
import { copyToClipboard } from '../Utils';
import { ViewerMedia } from '../types';
import { useHover } from '../hooks/useHover';

type Props = {
    media: ViewerMedia;
    onError?: (err: any) => void;
    onImmersedChange?: (immersed: boolean) => void;
    mouseMoving?: boolean;
    toggleFullScreen: () => void;
    fullscreen?: boolean;
    close: () => void;
}


export const VideoPlayer = ({
    media,
    onError,
    onImmersedChange,
    mouseMoving,
    toggleFullScreen,
    fullscreen = false,
    close
}: Props) => {
    // const document: any = window.document

    const src = 'http://192.168.1.106:3000/api/file/' + media.data.id;


    const [error, setError] = useState(false);

    // node refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    // const dragTargetRef = useRef(null)

    // timeout refs
    const clickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    // const mouseMoveTimeout = useRef(null)

    const seekTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mobileShowControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // state
    const [playing, setPlaying] = useState(false);
    const playingRef = useRef(false);

    const [progressPercent, setProgressPercent] = useState(0);
    // const [fullscreen, setFullscreen] = useState(false)

    const [videoCurrentTime, setVideoCurrentTime] = useState<string | null>(null);
    const [videoDuration, setVideoDuration] = useState<string | null>(null);

    // const [mouseMoving, setMouseMoving] = useState(false)
    // const mouseMoving = useMouseMoving(videoPlayerRef)

    const [seeking, setSeeking] = useState(0);

    const [topRef, topControlsHovered] = useHover<HTMLDivElement>();
    const [bottomRef, bottomControlsHovered] = useHover<HTMLDivElement>();

    // Mobile stuff
    const [mobileShowControls, setMobileShowControls] = useState(true);
    const isMobile = useMobile();

    const { coords, dragging } = useDrag(progressRef);

    const togglePlaying = () => {
        const video = videoRef.current;
        if (!video) return;
        // console.log(video)

        // setPlaying(video.paused)

        if (video.paused) {
            setPlaying(true);
        } else {
            setPlaying(false);
        }
    };

    const formatTime = (totalSeconds: number) => {
        // console.log(totalSeconds)
        if (isNaN(totalSeconds)) return null;

        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);

        let time = '';
        if (hours) {
            time += `${hours}:`;
        }
        time += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        // console.log(time)

        return time;
    };

    const handleProgress = () => {
        const video = videoRef.current;
        if (!video) return;

        const percent = (video.currentTime / video.duration) * 100;

        const currentTime = formatTime(video.currentTime);
        const duration = formatTime(video.duration);

        if (videoDuration !== duration) {
            setVideoDuration(duration);
        }

        setVideoCurrentTime(currentTime);
        setProgressPercent(percent);
    };

    const clickProgress = (e: React.MouseEvent<HTMLDivElement>) => {
        const video = videoRef.current;
        const progress = progressRef.current;
        if (!video || !progress) return;

        const time = (e.nativeEvent.offsetX / progress.offsetWidth) * video.duration;
        // console.log(time)
        video.currentTime = time;
    };

    useEffect(() => {
        if (!coords) return;

        // console.log(coords)

        const video = videoRef.current;
        const progress = progressRef.current;
        if (!video || !progress) return;

        const clientX = coords.x;

        const rect = progress.getBoundingClientRect();
        const x = Math.min(progress.offsetWidth, Math.max(clientX - rect.left, 0));

        // console.log(x)
        const time = (x / progress.offsetWidth) * video.duration;
        // console.log(time)

        setVideoCurrentTime(formatTime(time));
        setProgressPercent((x / progress.offsetWidth) * 100);

        video.currentTime = time;
    }, [coords]);

    const handleDoubleClick = (
        clickCallback: () => void,
        dblClickCallback: () => void,
        delay = 200
    ) => {

        // console.log('click')
        if (clickTimeout.current !== null) {
            if (clickTimeout.current) {
                clearTimeout(clickTimeout.current);
            }

            clickTimeout.current = null;
            // console.log('double click executed')
            return dblClickCallback();
        } else {
            clickTimeout.current = setTimeout(() => {
                if (clickTimeout.current) {
                    clearTimeout(clickTimeout.current);
                }

                clickTimeout.current = null;
                // console.log('single click executed')
                return clickCallback();
            }, delay);
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        // console.log(e)
        const video = videoRef.current;
        if (!video) return;

        switch (e.key) {
            case 'ArrowLeft':
                // Seek -5
                video.currentTime = Math.max(video.currentTime - 5, 0);
                break;
            case 'ArrowRight':
                // Seek +5
                video.currentTime = Math.min(video.currentTime + 5, video.duration);
                break;
            case 'j':
                // Seek -10
                video.currentTime = Math.max(video.currentTime - 10, 0);
                break;
            case 'l':
                // Seek +10
                video.currentTime = Math.min(video.currentTime + 10, video.duration);
                break;
            case ' ':
            case 'k':
                togglePlaying();
                break;
            case 'f':
                toggleFullScreen();
                break;
        }
    };

    const playbackStateChanged = (e: Event) => {
        // console.log(e)
        // console.log('playback state changed')

        if (e.type === 'play') {
            setPlaying(true);
        } else if (e.type === 'pause') {
            setPlaying(false);
        }
    };

    const toggleMobileShowControls = () => {
        const newState = !mobileShowControls;
        setMobileShowControls(newState);

        refreshMobileControlsTimeout(playing && newState);
    };

    const mobileHandleClicks = (e: React.MouseEvent<HTMLVideoElement>) => {
        const clickX = e.nativeEvent.offsetX;
        const playerWidth = videoRef.current?.offsetWidth;
        if (!playerWidth) return;

        // console.log('clickX', clickX)
        // console.log('playerWidth', playerWidth)

        const clickArea = 1 / 3;

        // LEFT: 0
        // CENTER: 1
        // RIGHT: 2
        const area = clickX < (playerWidth * clickArea) ? 0 : clickX > (playerWidth * (1 - clickArea)) ? 2 : 1;

        let seekTime;
        switch (area) {
            case 0:
                seekTime = -10;
                break;
            case 2:
                seekTime = 10;
                break;
            default:
                return toggleMobileShowControls();
        }

        if (clickTimeout.current !== null) {
            clearTimeout(clickTimeout.current);
            clickTimeout.current = setTimeout(() => {
                if (clickTimeout.current) {
                    clearTimeout(clickTimeout.current);
                }

                clickTimeout.current = null;
            }, 200);

            return seek(seekTime);
        } else {
            clickTimeout.current = setTimeout(() => {
                if (clickTimeout.current) {
                    clearTimeout(clickTimeout.current);
                }

                clickTimeout.current = null;
                return toggleMobileShowControls();
            }, 200);
        }
    };

    const seek = (seekTime: number) => {
        if (!seekTime) return;
        const video = videoRef.current;
        if (!video) return;

        video.currentTime = Math.max(Math.min(video.currentTime + seekTime, video.duration), 0);

        if (seekTimeout.current) {
            clearTimeout(seekTimeout.current);
        }

        seekTimeout.current = null;

        setSeeking(seekTime);
        seekTimeout.current = setTimeout(() => {
            if (seekTimeout.current) {
                clearTimeout(seekTimeout.current);

            }

            seekTimeout.current = null;
            return setSeeking(0);
        }, 500);

        if (mobileShowControls) {
            refreshMobileControlsTimeout();
        }
    };

    const download = () => {
        window.open(src + '/download');
    };


    const clearTimeouts = () => {
        if (clickTimeout.current) {
            clearTimeout(clickTimeout.current);
            clickTimeout.current = null;
        }

        if (seekTimeout.current) {
            clearTimeout(seekTimeout.current);
            seekTimeout.current = null;
        }

        // clearTimeout(mouseMoveTimeout.current)
        // mouseMoveTimeout.current = null
        if (mobileShowControlsTimeout.current) {
            clearTimeout(mobileShowControlsTimeout.current);
            mobileShowControlsTimeout.current = null;
        }
    };

    const handleError = (e: any) => {
        console.error('Error Loading video with src : %s', src);
        if (onError) onError(e);
        setError(true);
    };

    useEffect(() => {
        LOGGER.debug(`Loading video with src: ${src}`);
        const video = videoRef.current;
        if (!video) return;

        video.addEventListener('timeupdate', handleProgress);
        video.addEventListener('play', playbackStateChanged);
        video.addEventListener('pause', playbackStateChanged);

        video.addEventListener('error', handleError);

        video.addEventListener('loadedmetadata', handleProgress);

        (video as any).disableRemotePlayback = true;

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            video.removeEventListener('timeupdate', handleProgress);
            video.removeEventListener('play', playbackStateChanged);
            video.removeEventListener('pause', playbackStateChanged);

            video.removeEventListener('error', handleError);

            document.removeEventListener('keydown', handleKeyDown);

            clearTimeouts();

            video.pause();
            video.removeAttribute('src');
            video.load();
        };
    }, []);

    const refreshMobileControlsTimeout = (condition = true) => {

        if (mobileShowControlsTimeout.current) {
            clearTimeout(mobileShowControlsTimeout.current);
            mobileShowControlsTimeout.current = null;
        }

        if (condition) {
            mobileShowControlsTimeout.current = setTimeout(() => {
                if (playingRef.current) {
                    if (mobileShowControlsTimeout.current) {
                        clearTimeout(mobileShowControlsTimeout.current);
                        mobileShowControlsTimeout.current = null;
                    }

                    return setMobileShowControls(false);
                }
            }, 2000);
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (playing) {
            playingRef.current = true;
            if (video.paused) {
                video.play();
            }

            if (isMobile) {
                refreshMobileControlsTimeout(mobileShowControls);
            }
        } else {
            playingRef.current = false;
            if (!video.paused) {
                video.pause();
            }

            refreshMobileControlsTimeout(false);
            return setMobileShowControls(true);
        }
    }, [playing]);

    useEffect(() => {
        refreshMobileControlsTimeout(!dragging);
    }, [dragging]);

    const videoLoaded = !!videoDuration;

    const isImmersed = useMemo(() => {
        if (dragging) return false;

        if (isMobile) {
            // Mobile
            if (mobileShowControls) {
                return false;
            }
        } else {
            // Desktop
            if (mouseMoving || topControlsHovered || bottomControlsHovered || !videoLoaded || !playing) {
                return false;
            }
        }

        return true;
    }, [dragging, isMobile, mobileShowControls, mouseMoving, topControlsHovered, bottomControlsHovered, videoLoaded, playing]);

    useEffect(() => {
        // console.log('isImmersed', isImmersed)
        if (onImmersedChange) onImmersedChange(isImmersed);
    }, [isImmersed]);

    const returnIf = (condition: boolean, className: string) => condition ? className : '';

    return (
        <>
            {(!videoLoaded && !error) && (
                <Spinner className="mt-16" />
            )}

            <div className={`relative overflow-hidden h-full w-full max-h-full max-w-full flex-none${returnIf((!videoLoaded && !error), ' hidden')}${returnIf(isImmersed, ' cursor-none')}`}>
                <video
                    ref={videoRef}
                    src={src}
                    onClick={isMobile ?
                        mobileHandleClicks :
                        () => handleDoubleClick(togglePlaying, toggleFullScreen)
                    }
                    className="block h-full w-full max-h-screen max-w-full bg-black"
                />

                {media.type === 'audio' && media.data.hasThumb && (
                    <img
                        className="absolute inset-0 h-full w-full max-h-screen max-w-full pointer-events-none object-contain object-center"
                        src={`http://192.168.1.106:3000/api/thumb/${media.data.id}.jpg`}
                        alt='Audio thumbnail'
                    />
                )}

                {isMobile && (
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-half z-30">
                        <div className={`text-white place-self-center bg-black bg-opacity-25 p-2 rounded-full leading-none${returnIf(seeking >= 0, ' opacity-0')}`}>
                            <Icon icon={mdiRewind10} />
                        </div>
                        <div className={`text-white place-self-center bg-black bg-opacity-25 p-2 rounded-full leading-none${returnIf(seeking <= 0, ' opacity-0')}`}>
                            <Icon icon={mdiFastForward10} />
                        </div>
                    </div>
                )}

                <div
                    className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ease-in-out${returnIf(isImmersed, ' opacity-0')}`}
                    ref={topRef}
                >
                    {!isMobile && (
                        <div className="bg-gradient-to-b from-black bg-opacity-50 h-40 absolute top-0 inset-x-0 pointer-events-none z-20"></div>
                    )}

                    <div className={`flex flex-row flex-nowrap flex-auto top-0 inset-x-0 absolute p-2 z-30 items-center text-white${returnIf(!isImmersed, ' pointer-events-auto')}`}>
                        <IconButton
                            icon={mdiArrowLeft}
                            iconSize="24"
                            size="48"
                            className="transition-opacity duration-200 ease-in-out opacity-60 hover:opacity-100"
                            onClick={close}
                        />

                        <span className="flex-initial ml-3 overflow-hidden overflow-ellipsis break-words whitespace-nowrap">{media.data.name}</span>

                        <div className="flex flex-row flex-nowrap flex-initial ml-auto">
                            <IconButton
                                icon={mdiDownload}
                                iconSize="24"
                                size="48"
                                className="transition-opacity duration-200 ease-in-out opacity-60 hover:opacity-100"
                                onClick={download}
                            />
                            <IconButton
                                icon={mdiLinkVariant}
                                iconSize="24"
                                size="48"
                                className="transition-opacity duration-200 ease-in-out opacity-60 hover:opacity-100"
                                onClick={() => copyToClipboard(src)}
                            />
                            <IconButton
                                icon={mdiDotsVertical}
                                iconSize="24"
                                size="48"
                                className="transition-opacity duration-200 ease-in-out opacity-60 hover:opacity-100"
                            />
                        </div>
                    </div>

                    {error && (
                        <div
                            className="flex justify-center absolute transform -translate-y-50% top-1/2 inset-x-0 text-white"
                        >Unable to load media in the web player</div>
                    )}

                    {!error && (
                        <>
                            {isMobile && (
                                <div className={`flex justify-center absolute transform -translate-y-1/2 top-1/2 inset-x-0 text-white${returnIf(!isImmersed, ' pointer-events-auto')}`}>
                                    <IconButton
                                        icon={playing ? mdiPause : mdiPlay}
                                        onClick={togglePlaying}
                                        size="64"
                                    />
                                </div>
                            )}

                            {!isMobile && (
                                <div className="bg-gradient-to-t from-black bg-opacity-50 h-40 absolute bottom-0 inset-x-0 pointer-events-none z-20"></div>
                            )}

                            <div
                                className={`flex flex-row flex-nowrap flex-auto bottom-0 inset-x-0 absolute p-2 z-30 items-center text-white${returnIf(!isImmersed, ' pointer-events-auto')}`}
                                ref={bottomRef}
                            >
                                {!isMobile && (
                                    <IconButton
                                        icon={playing ? mdiPause : mdiPlay}
                                        iconSize="24"
                                        size="48"
                                        className="transition-opacity duration-200 ease-in-out opacity-60 hover:opacity-100"
                                        onClick={togglePlaying}
                                    />
                                )}

                                <div className="flex flex-row flex-nowrap mx-3">
                                    <span>{videoCurrentTime}</span>
                                    <span className="mx-1">/</span>
                                    <span>{videoDuration}</span>
                                </div>

                                <div className="flex items-center h-12 cursor-pointer w-full relative mx-3" ref={progressRef} onClick={clickProgress}>
                                    <div className="absolute h-0.5 w-full bg-white bg-opacity-30 pointer-events-none"></div>
                                    <div className="absolute h-0.5 bg-primary-500" style={{ width: `${progressPercent}% ` }}>
                                        <div className="h-2.5 w-2.5 bg-white absolute top-1/2 -right-1.25 transform -translate-y-1/2 rounded-md"></div>
                                    </div>
                                </div>

                                {/* <IconButton
                                    icon={mdiVolumeHigh}
                                    iconSize="24"
                                    size="48"
                                    className="transition-opacity duration-200 ease-in-out opacity-60 hover:opacity-100"
                                /> */}

                                {/* <IconButton
                                    icon={mdiPictureInPictureBottomRight}
                                    iconSize="24"
                                    size="48"
                                    className="transition-opacity duration-200 ease-in-out opacity-60 hover:opacity-100"
                                /> */}

                                <IconButton
                                    icon={fullscreen ? mdiFullscreenExit : mdiFullscreen}
                                    iconSize="24"
                                    size="48"
                                    className="transition-opacity duration-200 ease-in-out opacity-60 hover:opacity-100"
                                    onClick={toggleFullScreen}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};
