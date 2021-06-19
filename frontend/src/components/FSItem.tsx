import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Icon } from './Icon';
import { mdiFolder, mdiFile, mdiImage, mdiVideo, mdiMusicBox, mdiPlay } from '@mdi/js';

import { useLongPress } from '../hooks/useLongPress';
import { FsFile } from '../types';
import { copyToClipboard } from '../Utils';

type Props = {
    className?: string;
    item: FsFile;
    onClick: (event: React.MouseEvent, item: FsFile) => void;
    onDoubleClick: (event: React.MouseEvent, item: FsFile) => void;
    onLongPress: (event: React.MouseEvent, item: FsFile) => void;
    selected: boolean;
    onEnter: (item: FsFile) => void;
    onSpace: (event: React.KeyboardEvent<HTMLDivElement>, item: FsFile) => void;
    onFocus: (itemId: string) => void;
}

const FSItem = React.forwardRef((props: Props, ref: React.ForwardedRef<HTMLDivElement>) => {
    const { className, item, selected, onClick, onDoubleClick, onLongPress, onEnter, onSpace, onFocus, ...rest } = props;

    // console.log('render')

    const [thumbSrc, setThumbSrc] = useState<string | null>(null);

    const extension = item.name.split('.').pop();

    const getFileType = useMemo(() => {
        switch (extension) {
            case 'gif':
            case 'jpg':
            case 'jpeg':
            case 'png':
                return mdiImage;
            case 'avi':
            case 'mkv':
            case 'mp4':
            case 'm4v':
            case 'webm':
                return mdiVideo;
            case 'mp3':
            case 'wav':
                return mdiMusicBox;
            default:
                return mdiFile;
        }
    }, [extension]);

    const humanFileSize = (size: number) => {
        const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
        return (size / Math.pow(1024, i)).toFixed(2) /** 1*/ + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    };

    const click = (e: React.MouseEvent) => {
        // console.log('Single Click', e.type)

        onClick(e, item);
    };

    const doubleClick = (e: React.MouseEvent) => {
        // console.log('Double Click', e.type)
        onDoubleClick(e, item);
    };

    const longPress = (e: React.MouseEvent) => {
        // console.log('Long Press', e.type)
        onLongPress(e, item);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        switch (e.key) {
            case 'Enter':
                onEnter(item);
                break;
            case ' ':
                onSpace(e, item);
                break;
        }
    };

    const formattedDuration = useMemo(() => {
        if (!item || !item.metadata || !item.metadata.duration) return;

        let totalSeconds = item.metadata.duration;
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

        return time;
    }, [item]);

    const longPressHandlers = useLongPress(click, doubleClick, longPress);

    useEffect(() => {
        if (!item.hasThumb) return;

        let img: HTMLImageElement | null = new Image();
        img.onload = () => {
            if (!img) return;
            // thumbRef.current.style.backgroundImage = 'url("' + img.src + '")'
            setThumbSrc(img.src);
        };
        img.src = `http://192.168.1.106:3000/api/thumb/${item.id}.jpg`;

        return () => {
            img = null;
        };
    }, [item.hasThumb, item.id]);

    const date = useMemo(() => {
        const parsed = item.name.match(/(20\d{2})-?(\d{2})-?(\d{2})/);

        if (parsed) {
            // const [, year, month, day] = parsed;
            const year = parseInt(parsed[1]);
            const month = parseInt(parsed[2]);
            const day = parseInt(parsed[3]);

            // console.log([year, month, day], item.name);
            return { year, month, day };
        }

        return null;
    }, [item.name]);

    return (
        <div
            className="fs-item"
            ref={ref}
            tabIndex={0}
            {...longPressHandlers}
            {...rest}
            aria-selected={selected}
            onKeyDown={handleKeyDown}
            onFocus={() => onFocus(item.id)}
            onContextMenu={(e) => {
                e.preventDefault();
                copyToClipboard('http://192.168.1.106:3000/api/file/' + item.id);
            }}
        >
            <div className="fs-item__img">
                {thumbSrc ?
                    (
                        // <div className="thumb" style={{ backgroundImage: `url(${thumbSrc})` }} />
                        <img src={thumbSrc} alt="thumbnail" />
                    ) : (
                        <Icon icon={item.isDirectory ? mdiFolder : getFileType} />
                    )
                }

                {!item.isDirectory && (
                    <div className="extension">{extension}</div>
                )}

                {item.metadata && !Number.isNaN(item.metadata.duration) && (
                    <div className="duration">
                        <Icon icon={mdiPlay} />
                        <span>{formattedDuration}</span>
                    </div>
                )}
            </div>
            <div className="fs-item__meta" >
                <span className="fs-item__name" title={item.name}>{item.name}</span>
                <span className="fs-item__filecount">{item.isDirectory ? `${item.fileCount} files` : humanFileSize(item.size)}</span>
            </div>
        </div>
    );
});

FSItem.displayName = 'FSItem';

export { FSItem };