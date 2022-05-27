import * as React from 'react';
import { useCallback, useRef, useState } from 'react';

import { Spinner } from './Spinner';
import { ListItem } from './ListItem';

import { useMobile } from '../context/MobileProvider';
import { File, FileOrFolder, ViewerMedia } from '../types';
import { useSettings } from '../hooks/useSettings';
import { ListItemDetails } from './ListItemDetails';

type Props = {
    files: FileOrFolder[];
    fileRefs: React.RefObject<HTMLDivElement>[];
    fetching: boolean;
    setSelectedFiles: React.Dispatch<React.SetStateAction<string[]>>;
    selectedFiles: string[];
    setFocusedListItem: (i: number) => void;
    setDirectoryId: (id: string) => void;
    setViewerMedia: (media: File) => void;
};

const uiSizeClasses = {
    xs: 'grid-cols-1/5',
    sm: 'grid-cols-1/4',
    md: 'grid-cols-1/3',
    lg: 'grid-cols-1/2',
    xl: 'grid-cols-full',
};

// TODO: Only render visible items
// TODO: Only generate visible thumbnails
// TODO: Selection box with cursor
export const ItemList = ({
    files,
    fileRefs,
    fetching,
    selectedFiles,
    setSelectedFiles,
    setDirectoryId,
    setViewerMedia,
    setFocusedListItem,
}: Props) => {
    const itemlistWrapperRef = useRef<HTMLDivElement>(null);
    const itemlistRef = useRef<HTMLDivElement>(null);

    const { settings } = useSettings();

    const isMobile = useMobile();

    const setSelected = (item: FileOrFolder, addToSelection: boolean) => {
        const id = item.id;

        // console.log(item)

        if (!addToSelection) {
            return setSelectedFiles((prevSelectedFiles) => {
                if (prevSelectedFiles.includes(id) && prevSelectedFiles.length <= 1) {
                    return [];
                }

                return [id];
            });
        }

        setSelectedFiles((prevSelectedFiles) => {
            if (prevSelectedFiles.includes(id)) {
                return prevSelectedFiles.filter((i) => i !== id);
            }

            return [...prevSelectedFiles, id];
        });
    };

    const clearSelected = (e: React.MouseEvent<HTMLDivElement>) => {
        // console.log(e.target)

        if (
            (e.target === itemlistWrapperRef.current || e.target === itemlistRef.current) &&
            !e.ctrlKey &&
            selectedFiles &&
            selectedFiles.length > 0
        ) {
            return setSelectedFiles([]);
        }
    };

    const handleItemClick = useCallback(
        (e, item) => {
            // console.log(e.type)
            // console.log(item)

            if (e.type === 'touchend') {
                if (selectedFiles && selectedFiles.length) {
                    return setSelected(item, true);
                }

                return itemPrimaryAction(item);
            }

            return setSelected(item, e.ctrlKey);
        },
        [selectedFiles]
    );

    const handleItemDoubleClick = useCallback((e, item) => {
        if (e.type === 'touchend') return;

        itemPrimaryAction(item);
    }, []);

    const handleItemLongPress = useCallback((e, item) => {
        if (e.type === 'touchend' || e.type === 'touchstart') {
            return setSelected(item, true);
        }
    }, []);

    const itemPrimaryAction = (item: FileOrFolder) => {
        if (item.directory) {
            return setDirectoryId(item.id);
        }

        if (!item.contentType) {
            return console.log('unsupported file format');
        }

        setViewerMedia(item);
    };

    const handleItemOnFocus = (e: React.FocusEvent<HTMLDivElement>, item: FileOrFolder) => {
        // console.log(id)
        const index = files.findIndex((e) => e.id === item.id);
        // console.log(index)
        setFocusedListItem(index);
    };

    const [columnWidths, setColumnWidths] = useState<{ [s: string]: number | string | undefined }>({
        NAME: undefined,
        TYPE: '20%',
        SIZE: '20%',
    });

    const columns = [
        {
            id: 'NAME',
            content: 'Name',
        },
        {
            id: 'TYPE',
            content: 'Type',
        },
        {
            id: 'SIZE',
            content: 'Size',
        },
    ];

    return (
        <div
            className={`flex flex-col flex-auto relative ${
                settings.viewMode === 'grid' ? ' overflow-y-auto' : 'overflow-hidden'
            }`}
            onMouseDown={(e) => clearSelected(e)}
            ref={itemlistWrapperRef}
        >
            {/* {isMobile && (
                <MobileSort list={listEnabled} setList={setListEnabled} />
            )} */}

            {settings.viewMode === 'details' && (
                <div className="flex flex-row p-2">
                    {columns.map((e, i) => {
                        if (i === 0) {
                            return (
                                <div key={e.id} className="pl-2 flex-1">
                                    {e.content}
                                </div>
                            );
                        }

                        return (
                            <div key={e.id} style={{ width: columnWidths[e.id] }}>
                                {e.content}
                            </div>
                        );
                    })}
                </div>
            )}

            {fetching ? (
                <Spinner position="center" className="top-16" />
            ) : files.length ? (
                settings.viewMode === 'grid' ? (
                    <div
                        className={`grid justify-between items-start ${
                            isMobile
                                ? `${uiSizeClasses[settings.uiSize]} gap-y-2 gap-x-0 mt-0 mb-4 mx-4`
                                : 'grid-cols-128px my-4 mx-8 gap-1'
                        }`}
                        ref={itemlistRef}
                    >
                        {files.map((item, i: number) => {
                            const selected = selectedFiles.includes(item.id);
                            return (
                                <ListItem
                                    key={item.id}
                                    item={item}
                                    ref={fileRefs[i]}
                                    selected={selected}
                                    onClick={(e: any) => handleItemClick(e, item)}
                                    onDoubleClick={(e: any) => handleItemDoubleClick(e, item)}
                                    onLongPress={(e) => handleItemLongPress(e, item)}
                                    onFocus={(e) => handleItemOnFocus(e, item)}
                                    onEnter={() => itemPrimaryAction(item)}
                                    onSpace={(e) => setSelected(item, e.ctrlKey)}
                                    primaryAction={itemPrimaryAction}
                                    setSelected={setSelected}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col flex-nowrap overflow-y-auto" ref={itemlistRef}>
                        {files.map((item, i: number) => {
                            const selected = selectedFiles.includes(item.id);
                            return (
                                <ListItemDetails
                                    key={item.id}
                                    item={item}
                                    columnWidths={columnWidths}
                                    ref={fileRefs[i]}
                                    selected={selected}
                                    onClick={(e: any) => handleItemClick(e, item)}
                                    onDoubleClick={(e: any) => handleItemDoubleClick(e, item)}
                                    onLongPress={(e) => handleItemLongPress(e, item)}
                                    onFocus={(e) => handleItemOnFocus(e, item)}
                                    onEnter={() => itemPrimaryAction(item)}
                                    onSpace={(e) => setSelected(item, e.ctrlKey)}
                                    primaryAction={itemPrimaryAction}
                                    setSelected={setSelected}
                                />
                            );
                        })}
                    </div>
                )
            ) : (
                <span className="absolute top-8 left-1/2 transform -translate-x-1/2">No items found</span>
            )}
        </div>
    );
};
