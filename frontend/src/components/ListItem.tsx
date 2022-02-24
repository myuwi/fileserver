import * as React from 'react';
import { Icon } from './Icon';
import { mdiFolder, mdiLinkVariant, mdiPlay, mdiFolderOpenOutline, mdiDownload } from '@mdi/js';

import { FileOrFolder } from '../types';
import { copyToClipboard } from '../Utils';
import { ContextMenu } from './ContextMenu';
import { useListItem } from '../hooks/useListItem';

type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    item: FileOrFolder;
    selected: boolean;
    onClick?: (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
    onDoubleClick?: (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
    onLongPress?: (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
    onEnter?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    onSpace?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    primaryAction: (item: FileOrFolder) => void;
    setSelected: (item: FileOrFolder, addToSelection: boolean) => void;
};

export const ListItem = React.forwardRef(
    (
        {
            item,
            selected,
            onClick,
            onDoubleClick,
            onLongPress,
            onEnter,
            onSpace,
            primaryAction,
            setSelected,
            ...rest
        }: Props,
        ref: React.ForwardedRef<HTMLDivElement>
    ) => {
        const { eventHandlers, fileTypeIcon, humanFileSize, extension, contextMenu } = useListItem<HTMLDivElement>({
            item,
            selected,
            onClick,
            onDoubleClick,
            onLongPress,
            onEnter,
            onSpace,
        });

        return (
            <>
                <div
                    className={`relative rounded outline-none p-2 transition-colors duration-50 ease-in-out ${
                        selected ? 'bg-primary-500 bg-opacity-20' : 'hover:bg-secondary-500 hover:bg-opacity-5'
                    } select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-100`}
                    ref={ref}
                    tabIndex={0}
                    {...eventHandlers}
                    {...rest}
                    aria-selected={selected}
                >
                    <div className={'text-primary-500 relative rounded w-full pt-full'}>
                        {!item.directory && item.hasThumb ? (
                            <img
                                className="h-full w-full absolute bottom-0 left-1/2 object-contain object-bottom transform -translate-x-1/2 pointer-events-none"
                                src={`http://192.168.1.106:3000/api/thumb/${item.id}.jpg`}
                                alt="thumbnail"
                            />
                        ) : (
                            <Icon icon={!item.directory ? fileTypeIcon : mdiFolder} size="2/3" position="center" />
                        )}

                        {!item.directory && (
                            <div
                                className={
                                    'absolute left-1 bottom-1 rounded-sm overflow-hidden text-white uppercase py-0.5 px-1 text-sm bg-primary-500 shadow'
                                }
                            >
                                {extension}
                            </div>
                        )}

                        {/* {item.metadata && !Number.isNaN(item.metadata.duration) && (
                        <div className="duration">
                        <Icon icon={mdiPlay} />
                        <span>{formattedDuration}</span>
                        </div>
                    )} */}
                    </div>
                    <div className="text-center mt-1">
                        <span
                            className="block overflow-hidden overflow-ellipsis break-words whitespace-nowrap"
                            title={item.name}
                        >
                            {item.name}
                        </span>
                        <span className="text-xs text-secondary-700">
                            {item.directory
                                ? `${item.fileCount.total} ${item.fileCount.total === 1 ? 'file' : 'files'}`
                                : humanFileSize}
                        </span>
                    </div>
                </div>

                {contextMenu.open && (
                    <ContextMenu position={contextMenu.pos} onHide={() => contextMenu.setOpen(false)}>
                        {item.directory ? (
                            <ContextMenu.Item
                                icon={mdiFolderOpenOutline}
                                text="Open"
                                onClick={() => primaryAction(item)}
                            />
                        ) : (
                            <>
                                <ContextMenu.Item icon={mdiPlay} text="Play" onClick={() => primaryAction(item)} />
                                <ContextMenu.Item
                                    icon={mdiDownload}
                                    text="Download"
                                    onClick={() =>
                                        window.open('http://192.168.1.106:3000/api/file/' + item.id + '/download')
                                    }
                                />
                            </>
                        )}
                        <ContextMenu.Item
                            icon={mdiLinkVariant}
                            text="Copy Link"
                            onClick={() => copyToClipboard('http://192.168.1.106:3000/api/file/' + item.id)}
                        />
                    </ContextMenu>
                )}
            </>
        );
    }
);

ListItem.displayName = 'ListItem';
