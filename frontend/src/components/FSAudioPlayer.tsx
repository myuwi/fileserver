import { useEffect, useState, useRef, useCallback } from 'react';
import { Icon } from './Icon';

import { mdiPause, mdiPlay, mdiSkipPrevious, mdiSkipNext, mdiMusicBox, mdiArrowLeft } from '@mdi/js';
import { AppBar } from './AppBar';

type Props = {
    queue: any;
    setQueue: (queue: any[]) => void;
}

export const FSAudioPlayer = ({ queue, setQueue }: Props) => {

    // node refs
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const audioPage1Ref = useRef<HTMLDivElement>(null);
    const audioPageContainerRef = useRef<HTMLDivElement>(null);

    // value refs
    const mouseDown = useRef(false);
    const dragTargetRef = useRef<EventTarget | null>(null);

    // state
    const [playing, setPlaying] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);

    const [audioCurrentTime, setAudioCurrentTime] = useState('00:00');
    const [audioDuration, setAudioDuration] = useState('00:00');

    const [queuePos, setQueuePos] = useState<number>(0);

    const queueCurrent = queue[queuePos];

    const togglePlaying = () => {
        const audio = audioRef.current;
        if (!audio) return;
        // console.log(audio)

        if (audio.paused) {
            setPlaying(true);
        } else {
            setPlaying(false);
        }
    };

    const formatTime = (totalSeconds: number) => {
        if (isNaN(totalSeconds)) return '00:00';

        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);

        // console.log(hours, minutes, seconds)

        let time = '';
        // if (hours) {
        //     time += `${hours}:`
        //     time += `${minutes.toString().padStart(2, '0')}:`
        // } else {
        //     time += `${minutes.toString()}:`
        // }
        // time += `${seconds.toString().padStart(2, '0')}`
        if (hours) {
            time += `${hours}:`;
        }
        time += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // console.log(time)

        return time;
    };

    const handleProgress = useCallback(
        () => {
            const audio = audioRef.current;
            if (!audio) return;

            const percent = (audio.currentTime / audio.duration) * 100;

            const currentTime = formatTime(audio.currentTime);
            const duration = formatTime(audio.duration);

            if (audioDuration !== duration) {
                setAudioDuration(duration);
            }

            setAudioCurrentTime(currentTime);
            setProgressPercent(percent);
        },
        [],
    );


    const clickProgress = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const audio = audioRef.current;
        const progress = progressRef.current;
        if (!audio || !progress) return;

        const time = (e.nativeEvent.offsetX / progress.offsetWidth) * audio.duration;
        // console.log(time)
        audio.currentTime = time;
    };

    const handleDrag = (e: MouseEvent) => {
        if (!mouseDown.current) return;
        // console.log(mouseDown.current)
        // console.log(dragTargetRef.current)

        if (dragTargetRef.current === progressRef.current) {
            // console.log(e.offsetX)
            const audio = audioRef.current;
            const progress = progressRef.current;
            if (!audio || !progress) return;

            // console.log(offsetX)
            // console.log(progress.offsetWidth)

            const rect = progress.getBoundingClientRect();
            const x = Math.min(progress.offsetWidth, Math.max(e.clientX - rect.left, 0));

            // console.log(x)

            const time = (x / progress.offsetWidth) * audio.duration;
            // console.log(time)
            audio.currentTime = time;
        }
    };

    const toggleMouseDown = (e: MouseEvent) => {
        if (e.type === 'mouseup') {
            // console.log('mouseup')
            dragTargetRef.current = null;
            mouseDown.current = false;
            return;
        }

        if (e.type === 'mousedown') {
            // console.log('mousedown')
            // console.log(e.target)

            // if (e.target === progressRef.current) {
            //     dragTargetRef.current = progressRef.current
            //     // console.log(dragTargetRef.current)
            // }

            // console.log(e.offsetX)

            // console.log(mouseDownCoords.current)

            dragTargetRef.current = e.target;

            mouseDown.current = true;
            // console.log(dragTargetRef.current)
        }
    };

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // console.log(e)
        switch (e.key) {
            case ' ': // Space
            case 'k':
            case 'K':
                togglePlaying();
                break;
        }
    }, []);

    const playbackStateChanged = (e: Event) => {
        // console.log(e)
        // console.log('playback state changed')

        if (e.type === 'play') {
            setPlaying(true);
        } else if (e.type === 'pause') {
            setPlaying(false);
        }
    };

    // const [dragging, setDragging] = useState()
    // const [dragCoords, setDragCoords] = useState(null)

    // const dragMove = (e) => {
    //     e.preventDefault()

    //     const drag = dragRef.current

    //     const rect = drag.getBoundingClientRect()
    //     console.log(rect)

    //     const halfHeight = rect.height / 2

    //     const coords = e.touches && e.touches[0] && {
    //         clientX: e.touches[0].clientX,
    //         clientY: e.touches[0].clientY
    //     }
    //     console.log(coords)

    //     const windowHeight = window.innerHeight

    //     const y = Math.min(windowHeight - rect.height - 50, Math.max(coords.clientY - halfHeight, 0))

    //     setDragCoords(y)
    // }

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.addEventListener('timeupdate', handleProgress);
        audio.addEventListener('play', playbackStateChanged);
        audio.addEventListener('pause', playbackStateChanged);

        audio.addEventListener('loadedmetadata', handleProgress);

        document.addEventListener('keydown', handleKeyDown);

        document.addEventListener('mousedown', toggleMouseDown);
        document.addEventListener('mouseup', toggleMouseDown);
        document.addEventListener('mousemove', handleDrag);

        return () => {
            audio.removeEventListener('timeupdate', handleProgress);
            audio.removeEventListener('play', playbackStateChanged);
            audio.removeEventListener('pause', playbackStateChanged);

            document.removeEventListener('keydown', handleKeyDown);

            document.removeEventListener('mousedown', toggleMouseDown);
            document.removeEventListener('mouseup', toggleMouseDown);
            document.removeEventListener('mousemove', handleDrag);

            audio.pause();
            audio.removeAttribute('src');
            audio.load();
        };
    }, [handleKeyDown, handleProgress]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (playing && audio.paused) {
            audio.play();
        } else if (!playing && !audio.paused) {
            audio.pause();
        }
    }, [playing, queue]);

    const src = 'http://192.168.1.106:3000/api/file/' + queueCurrent.id;

    return (
        <div className="fs-audio">
            <audio
                ref={audioRef}
                src={src}
            />

            <AppBar>
                <Icon icon={mdiArrowLeft} onClick={() => setQueue([])} />
                <AppBar.Title>{queue[0].name}</AppBar.Title>
            </AppBar>

            <div className="fs-audio-content" ref={audioPageContainerRef}>
                <div className="fs-audio-page" ref={audioPage1Ref}>
                    <div className="fs-audio__image">
                        <div className="cover">
                            <Icon icon={mdiMusicBox} />
                        </div>
                    </div>
                </div>
                <div className="fs-audio-page">
                    <div className="queue">
                        <div className="queue-items">
                            {queue.map((e: any, i: number) => {
                                const current = queuePos === i;
                                const itemClasses = current ? 'queue-item current' : 'queue-item';
                                return (
                                    <div key={i} className={itemClasses} onClick={() => setQueuePos(i)}>
                                        <div className="index">{i + 1}</div>
                                        <div className="title">{e.name}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="fs-audio__controls">
                <div className="progress">
                    <div className="fs-audio__time">
                        <span>{audioCurrentTime}</span>
                    </div>

                    <div className="fs-audio__progress-wrapper" ref={progressRef} onClick={clickProgress}>
                        <div className="fs-audio__progress">
                            <div className="fs-audio__progress-filled" style={{ width: `${progressPercent}% ` }}></div>
                        </div>
                    </div>

                    <div className="fs-audio__time">
                        <span>{audioDuration}</span>
                    </div>

                </div>
                <div className="buttons">
                    <Icon icon={mdiSkipPrevious} />
                    <Icon className="play" icon={playing ? mdiPause : mdiPlay} onClick={togglePlaying} />
                    <Icon icon={mdiSkipNext} />
                    {/* <Icon icon={mdiPlaylistMusicOutline} onClick={() => setFullscreen(!fullscreen)} /> */}
                </div>
            </div>
        </div>
    );
};
