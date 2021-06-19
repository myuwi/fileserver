import { useCallback, useRef } from 'react';

import createPersistedState from 'use-persisted-state';

import { Spinner } from './Spinner';
import { FSItem } from './FSItem';

import { useMobile } from '../context/MobileProvider';
import classNames from 'classnames';
import { FsFile } from '../types';

type Props = {
    files: FsFile[];
    fileRefs: React.RefObject<HTMLDivElement>[];
    fetching: boolean;
    setSelectedFiles: React.Dispatch<React.SetStateAction<string[]>>;
    selectedFiles: string[];
    setFocusedListItem: (i: number) => void;
    setDirectoryId: (id: string) => void;
    setViewerMedia: (media: any) => void;
}

const useUiSize = createPersistedState('uiSize');
const useListMode = createPersistedState('listMode');

// TODO: Only render visible items
// TODO: Only generate visible thumbnails
const FSItemList = ({ files, fileRefs, fetching, selectedFiles, setSelectedFiles, setDirectoryId, setViewerMedia, setFocusedListItem }: Props) => {

    const itemlistWrapperRef = useRef<HTMLDivElement>(null);
    const itemlistRef = useRef<HTMLDivElement>(null);

    const [uiSize] = useUiSize('m');
    const [listEnabled] = useListMode(false);

    const isMobile = useMobile();

    const setSelected = (e: any, item: FsFile) => {
        const id = item.id;

        // console.log(item)

        if (!e.ctrlKey && !isMobile) {
            return setSelectedFiles((prevSelectedFiles) => {
                if (prevSelectedFiles.includes(id) && prevSelectedFiles.length <= 1) {
                    return [];
                }

                return [id];
            });
        }

        setSelectedFiles((prevSelectedFiles: any) => {
            if (prevSelectedFiles.includes(id)) {
                return prevSelectedFiles.filter((i: any) => i !== id);
            }

            const newArr = JSON.parse(JSON.stringify(prevSelectedFiles));
            newArr.push(id);
            return newArr;
        });
    };

    const clearSelected = (e: any) => {
        // console.log(e.target)

        if ((e.target === itemlistWrapperRef.current || e.target === itemlistRef.current) &&
            !e.ctrlKey && selectedFiles && selectedFiles.length > 0) {
            return setSelectedFiles([]);
        }
    };

    const handleItemClick = useCallback((e, item) => {
        // console.log(e.type)
        // console.log(item)

        if (e.type === 'touchend') {
            if (selectedFiles && selectedFiles.length) {
                return setSelected(e, item);
            }

            return itemPrimaryAction(item);
        }

        return setSelected(e, item);
    }, [selectedFiles]);

    const handleItemDoubleClick = useCallback((e, item) => {
        if (e.type === 'touchend') return;

        itemPrimaryAction(item);
    }, []);

    const handleItemLongPress = useCallback((e, item) => {
        if (e.type === 'touchend' || e.type === 'touchstart') {
            return setSelected(e, item);
        }
    }, []);

    const itemPrimaryAction = (item: FsFile) => {
        if (item.isDirectory) {
            return setDirectoryId(item.id);
        }

        const extension = item.name.split('.').pop()?.trim().toLowerCase();

        const getTypeOf = (extension?: string) => {
            switch (extension) {
                case 'gif':
                case 'jpg':
                case 'jpeg':
                case 'png':
                    return 'image';
                case 'avi':
                case 'mkv':
                case 'mp4':
                case 'm4v':
                case 'webm':
                    return 'video';
                case 'mp3':
                case 'wav':
                    return 'audio';
                default:
                    return undefined;
            }
        };

        const type = getTypeOf(extension);

        if (!type) {
            return console.log('unsupported file format');
        }

        setViewerMedia({
            name: item.name,
            id: item.id,
            type: type
        });
    };

    const handleItemOnFocus = (id: string) => {
        // console.log(id)
        const index = files.findIndex((e: any) => e.id === id);
        // console.log(index)
        setFocusedListItem(index);
    };

    const itemListClasses = classNames({
        'fs-itemlist': true,
        mobile: isMobile,
        [uiSize]: !listEnabled,
        list: listEnabled,
        grid: !listEnabled
    });

    return (
        <div className="fs-itemlist-wrapper"
            onMouseDown={(e) => clearSelected(e)}
            ref={itemlistWrapperRef}
        >
            {/* {isMobile && (
                <FSMobileSort list={listEnabled} setList={setListEnabled} />
            )} */}

            {fetching ? (
                <Spinner />
            ) : (
                files.length ? (
                    <div className={itemListClasses} ref={itemlistRef}>
                        {files.map((item, i: number) => {
                            const selected = selectedFiles.includes(item.id);
                            return (
                                <FSItem
                                    key={item.id}
                                    item={item}
                                    ref={fileRefs[i]}
                                    selected={selected}
                                    onClick={handleItemClick}
                                    onDoubleClick={handleItemDoubleClick}
                                    onLongPress={handleItemLongPress}
                                    onFocus={handleItemOnFocus}
                                    onEnter={itemPrimaryAction}
                                    onSpace={setSelected}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <span className="no-files">No items found</span>
                )

            )}
        </div>
    );
};

export { FSItemList };
