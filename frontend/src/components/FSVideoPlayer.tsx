import { useEffect, useMemo, useState, useRef } from 'react';
import { Icon } from './Icon';
import { mdiPause, mdiPlay, mdiFullscreen, mdiFullscreenExit, mdiFastForward10, mdiRewind10, mdiArrowLeft, mdiDotsVertical, mdiLinkVariant, mdiDownload } from '@mdi/js';

import { useDrag } from '../hooks/useDrag';

import { useMobile } from '../context/MobileProvider';
import { Spinner } from './Spinner';

import classNames from 'classnames';
import { IconButton } from './IconButton';
import { LOGGER } from '../LOGGER';

type Props = {
    media: any;
    onError?: (err: any) => void;
    onImmersedChange?: (immersed: boolean) => void;
    mouseMoving?: boolean;
    toggleFullScreen: () => void;
    fullscreen?: boolean;
    close: () => void;
}


const FSVideoPlayer = ({ media, onError, onImmersedChange, mouseMoving, toggleFullScreen, fullscreen = false, close }: Props) => {
    // const document: any = window.document

    const src = 'http://192.168.1.106:3000/api/fs/file/' + media.id;


    const [error, setError] = useState(false);

    // node refs
    const videoRef = useRef<any>();
    const progressRef = useRef<any>();

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

    // Mobile stuff
    const [mobileShowControls, setMobileShowControls] = useState(true);
    const isMobile = useMobile();

    const { coords, dragging } = useDrag(progressRef);

    const togglePlaying = () => {
        const video = videoRef.current;

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

        const percent = (video.currentTime / video.duration) * 100;

        const currentTime = formatTime(video.currentTime);
        const duration = formatTime(video.duration);

        if (videoDuration !== duration) {
            setVideoDuration(duration);
        }

        setVideoCurrentTime(currentTime);
        setProgressPercent(percent);
    };

    const clickProgress = (e: any) => {
        const video = videoRef.current;
        const progress = progressRef.current;

        const time = (e.nativeEvent.offsetX / progress.offsetWidth) * video.duration;
        // console.log(time)
        video.currentTime = time;
    };

    useEffect(() => {
        if (!coords) return;

        // console.log(coords)

        const video = videoRef.current;
        const progress = progressRef.current;

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

    const handleDoubleClick = (clickCallback: any, dblClickCallback: any, delay = 200) => {

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

    const handleKeyDown = (e: any) => {
        // console.log(e)
        const video = videoRef.current;

        switch (e.keyCode) {
            case 37: // <-
                // Seek -5
                video.currentTime = Math.max(video.currentTime - 5, 0);
                break;
            case 39: // ->
                // Seek +5
                video.currentTime = Math.min(video.currentTime + 5, video.duration);
                break;
            case 74: // J
                // Seek -10
                video.currentTime = Math.max(video.currentTime - 10, 0);
                break;
            case 76: // L
                // Seek +10
                video.currentTime = Math.min(video.currentTime + 10, video.duration);
                break;
            case 32: // Space
            case 75: // K
                togglePlaying();
                break;
            case 70: // F
                toggleFullScreen();
                break;
        }
    };

    const playbackStateChanged = (e: any) => {
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

    const mobileHandleClicks = (e: any) => {
        const clickX = e.nativeEvent.offsetX;
        const playerWidth = e.target.offsetWidth;

        // console.log('clickX', clickX)
        // console.log('playerWidth', playerWidth)

        const clickArea = 0.33;

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

    const openInNew = () => {
        window.open(src.replace('http', 'vlc'), '_blank');
    };

    const copyLink = () => {
        navigator.clipboard.writeText(src);
    };

    const download = () => {
        window.open(src + '/download');
    };

    const copyToClipboard = (str: string) => {
        const elem = document.createElement('textarea');
        elem.value = str;
        document.body.appendChild(elem);
        elem.select();
        document.execCommand('copy');
        document.body.removeChild(elem);
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

        video.addEventListener('timeupdate', handleProgress);
        video.addEventListener('play', playbackStateChanged);
        video.addEventListener('pause', playbackStateChanged);

        video.addEventListener('error', handleError);

        video.addEventListener('loadedmetadata', handleProgress);

        video.disableRemotePlayback = true;

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
            if (mouseMoving || !videoLoaded || !playing) {
                return false;
            }
        }

        return true;
    }, [dragging, mobileShowControls, mouseMoving, videoLoaded, playing]);

    useEffect(() => {
        // console.log('isImmersed', isImmersed)
        if (onImmersedChange) onImmersedChange(isImmersed);
    }, [isImmersed]);


    const classes = classNames({
        'fs-video': true,
        immersed: isImmersed,
        mobile: isMobile,
        fullscreen: fullscreen,
        hide: (!videoLoaded && !error)
    });

    return (
        <>
            {(!videoLoaded && !error) && (
                <Spinner />
            )}

            <div className={classes}>
                <video
                    ref={videoRef}
                    src={src}
                    onClick={isMobile ?
                        mobileHandleClicks :
                        () => handleDoubleClick(togglePlaying, toggleFullScreen)
                    }
                />

                {isMobile && (
                    <div className="fs-video__seek">
                        <div className={seeking < 0 ? 'show' : undefined}>
                            <Icon icon={mdiRewind10} />
                        </div>
                        <div className={seeking > 0 ? 'show' : undefined}>
                            <Icon icon={mdiFastForward10} />
                        </div>
                    </div>
                )}

                <div className="fs-video__controls">
                    {!isMobile && (
                        <div className="top-gradient"></div>
                    )}

                    <div className="top">
                        <IconButton icon={mdiArrowLeft} onClick={close} />

                        <span className="title">{media.name}</span>

                        <div className="buttons">
                            <IconButton icon={mdiDownload} onClick={download} />
                            <IconButton icon={mdiLinkVariant} onClick={() => copyToClipboard(src)} />
                            <IconButton icon={mdiDotsVertical} />
                        </div>
                    </div>

                    {error && (
                        <div className="error">Unable to load the content in the web player</div>
                    )}

                    {!error && (
                        <>
                            {isMobile && (
                                <div className="middle">
                                    <IconButton icon={playing ? mdiPause : mdiPlay} onClick={togglePlaying} />
                                </div>
                            )}

                            {!isMobile && (
                                <div className="bottom-gradient"></div>
                            )}

                            <div className="bottom">
                                {!isMobile && (
                                    <IconButton icon={playing ? mdiPause : mdiPlay} onClick={togglePlaying} />
                                )}

                                <div className="fs-video__time">
                                    <span>{videoCurrentTime}</span>
                                    <span className="separator">/</span>
                                    <span>{videoDuration}</span>
                                </div>

                                <div className="fs-video__progress" ref={progressRef} onClick={clickProgress}>
                                    <div className="fs-video__progress-background"></div>
                                    <div className="fs-video__progress-played" style={{ width: `${progressPercent}% ` }}></div>
                                </div>


                                <IconButton icon={fullscreen ? mdiFullscreenExit : mdiFullscreen} onClick={toggleFullScreen} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export { FSVideoPlayer };
