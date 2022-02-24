import { FileOrFolder } from '../types';
import { useLongPress } from './useLongPress';
import { useMemo, useState } from 'react';
import { mdiFile, mdiImage, mdiMusicBox, mdiVideo } from '@mdi/js';
import { useMobile } from '../context/MobileProvider';

type Props<T> = {
    item: FileOrFolder;
    selected: boolean;
    onClick?: (event: React.MouseEvent<T> | React.TouchEvent<T>) => void;
    onDoubleClick?: (event: React.MouseEvent<T> | React.TouchEvent<T>) => void;
    onLongPress?: (event: React.MouseEvent<T> | React.TouchEvent<T>) => void;
    onEnter?: (event: React.KeyboardEvent<T>) => void;
    onSpace?: (event: React.KeyboardEvent<T>) => void;
}

export const useListItem = <T,>({
    item,
    selected,
    onClick,
    onDoubleClick,
    onLongPress,
    onEnter,
    onSpace
}: Props<T>) => {
    const isMobile = useMobile();

    const handleClick = (e: React.MouseEvent<T> | React.TouchEvent<T>) => {
        !!onClick && onClick(e);
    };

    const handleDoubleClick = (e: React.MouseEvent<T> | React.TouchEvent<T>) => {
        !!onDoubleClick && onDoubleClick(e);
    };

    const handleLongPress = (e: React.MouseEvent<T> | React.TouchEvent<T>) => {
        !!onLongPress && onLongPress(e);
    };

    const clickHandlers = useLongPress(handleClick, handleDoubleClick, handleLongPress);

    const handleContextMenu = (e: React.MouseEvent<T, MouseEvent>) => {
        e.preventDefault();

        if (isMobile) return;

        setContextMenuPos({ x: e.clientX, y: e.clientY + 2 });
        setContextMenuOpen(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent<T>) => {
        switch (e.key) {
            case 'Enter':
                !!onEnter && onEnter(e);
                break;
            case ' ':
                !!onSpace && onSpace(e);
                break;
        }
    };

    const extension = item.name.split('.').pop();

    const fileTypeIcon = useMemo(() => {
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

    const humanFileSize = useMemo(() => {
        if (item.directory) return '0B';
        const size = item.size;
        const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
        return (size / Math.pow(1024, i)).toFixed(2) /** 1*/ + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    }, []);

    const [contextMenuOpen, setContextMenuOpen] = useState(false);
    const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });


    // const formattedDuration = useMemo(() => {
    //     if (!item || !item.metadata || !item.metadata.duration) return;

    //     let totalSeconds = item.metadata.duration;
    //     if (isNaN(totalSeconds)) return null;

    //     const hours = Math.floor(totalSeconds / 3600);
    //     totalSeconds %= 3600;
    //     const minutes = Math.floor(totalSeconds / 60);
    //     const seconds = Math.floor(totalSeconds % 60);

    //     let time = '';
    //     if (hours) {
    //         time += `${hours}:`;
    //     }
    //     time += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    //     return time;
    // }, [item]);

    // const date = useMemo(() => {
    //     const parsed = item.name.match(/(\d{4}|\d{2})[.-]?(\d{1,2})[.-]?(\d{1,2})/);

    //     if (parsed) {
    //         // const [, year, month, day] = parsed;
    //         const year = parseInt(parsed[1]);
    //         const month = parseInt(parsed[2]);
    //         const day = parseInt(parsed[3]);

    //         const date = { year, month, day };
    //         console.log(date, item.name);
    //         return date;
    //     }

    //     return null;
    // }, [item.name]);

    return {
        eventHandlers: {
            ...clickHandlers,
            onKeyDown: handleKeyDown,
            onContextMenu: handleContextMenu
        },
        contextMenu: {
            open: contextMenuOpen,
            setOpen: setContextMenuOpen,
            pos: contextMenuPos,
            setPost: setContextMenuPos
        },
        extension,
        fileTypeIcon,
        humanFileSize
    };
};
