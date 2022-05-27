import * as React from 'react';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

import { File, FileOrFolder, ViewerMedia } from '../types';

import { mdiClose, mdiChevronRight, mdiChevronLeft, mdiFolder, mdiArrowUp, mdiRefresh } from '@mdi/js';

import { useCustomHistory } from '../hooks/useCustomHistory';
import { useMobile } from '../context/MobileProvider';

import { SearchBar } from '../components/SearchBar';
import { Switch } from '../components/Switch';
import { RadioGroup } from '../components/RadioGroup';

import { FSAppBar } from '../components/FSAppBar';
import { MediaViewer } from '../components/MediaViewer';
import { Sidenav } from '../components/Sidenav';
import { ItemList } from '../components/ItemList';

import { IconButton } from '../components/IconButton';
import { Icon } from '../components/Icon';

import { LOGGER } from '../LOGGER';

import { collator } from '../Utils';

import { BottomBar } from '../components/BottomBar';
import { UiSize, useSettings, ViewMode } from '../hooks/useSettings';
import { useFileFetching } from '../hooks/useFileFetching';

// TODO: Split stuff to separate components
// TODO: Context menu
// TODO: Rework Settings
// TODO: Change document title based on Media
// TODO: Toast notifications

export const FileSystem = () => {
    const isMobile = useMobile();

    // TODO: Convert to a custom hook
    const [filteredDirectoryFiles, setFilteredDirectoryFiles] = useState<FileOrFolder[]>([]);

    const firstRender = useRef(true);

    const searchBarRef = useRef<HTMLInputElement>(null);

    const [fileRefs, setFileRefs] = useState<React.RefObject<HTMLDivElement>[]>([]);

    const [focusedListItem, setFocusedListItem] = useState(0);

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [flattenDepth, setFlattenDepth] = useState(0);

    const { settings, updateSettings } = useSettings();

    const handleDarkModeChange = (enabled: boolean) => {
        updateSettings({
            type: 'DARK_MODE',
            payload: enabled,
        });
    };

    const handleUiSizeChange = (size: UiSize) => {
        updateSettings({
            type: 'UI_SIZE',
            payload: size,
        });
    };

    const handleViewModeChange = (viewMode: ViewMode) => {
        updateSettings({
            type: 'VIEW_MODE',
            payload: viewMode,
        });
    };

    // TODO: Selected File Info
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [viewerMedia, setViewerMedia] = useState<File | null>(null);

    const navigate = useNavigate();

    const { fetching, error, directoryId, data } = useFileFetching();
    const breadcrumbs: any[] | undefined = data?.breadcrumbs;

    const location = useLocation();

    useEffect(() => {
        if (viewerMedia && (!location.state || !location.state.mediaOpen)) {
            setViewerMedia(null);
        }
    }, [location]);

    useEffect(() => {
        // LOGGER.debug('Is First Render:', firstRender.current)
        if (firstRender.current) {
            firstRender.current = false;

            if (!viewerMedia && location.state && location.state.mediaOpen) {
                navigate(location.pathname, { replace: true });
            }
        } else {
            if (viewerMedia) {
                navigate(location.pathname, { state: { mediaOpen: true } });
            } else if (!viewerMedia && location.state && location.state.mediaOpen) {
                navigate(-1);
            }
        }
    }, [viewerMedia]);

    useEffect(() => {
        if (viewerMedia && viewerMedia.name) {
            document.title = `${viewerMedia.name} - File Server`;
        } else {
            document.title = 'File Server';
        }
    }, [viewerMedia]);

    const { canGoBack, canGoForward } = useCustomHistory();

    const setDirectoryId = (id: string | null) => {
        // console.log(id);
        if (!id) {
            return navigate('/');
        }

        navigate(`/${id}`);
    };

    const backDirectory = () => {
        // console.log('breadcrumbs', breadcrumbs)
        // console.log('Back Directory')

        if (!breadcrumbs || breadcrumbs.length <= 0) return;

        if (breadcrumbs.length <= 1) {
            return setDirectoryId(null);
        }

        // console.log(breadcrumbs[breadcrumbs.length - 2].id)
        setDirectoryId(breadcrumbs[breadcrumbs.length - 2].id);
    };

    const dotsOnClick = () => {
        // console.log('dots clicked')
        setSettingsOpen(!settingsOpen);
    };

    const changeFlattenDepth = () => {
        setFlattenDepth(flattenDepth > 0 ? 0 : 1);
    };

    const filterFiles = (files: FileOrFolder[]) => {
        const filteredFiles = files
            .filter((file: FileOrFolder) => {
                if (!searchQuery || searchQuery === '') return true;

                const words = searchQuery.toLowerCase().split(/ +/g);

                let search = file.name.toLowerCase();

                for (let i = 0; i < words.length; i++) {
                    const word = words[i];

                    if (search.includes(word)) {
                        search = search.replace(word, '');
                        continue;
                    } else {
                        return false;
                    }
                }

                return true;
            })
            .sort((a: FileOrFolder, b: FileOrFolder) => {
                if (a.directory && !b.directory) {
                    return -1;
                }
                if (!a.directory && b.directory) {
                    return 1;
                }

                return collator.compare(a.name, b.name);
            });

        setFileRefs(
            Array(filteredFiles.length)
                .fill(0)
                .map(() => React.createRef())
        );

        LOGGER.debug(filteredFiles);

        return filteredFiles;
    };

    useEffect(() => {
        if (!data?.files) return setFilteredDirectoryFiles([]);

        const files = filterFiles(data.files);

        setFilteredDirectoryFiles(files);
    }, [data, searchQuery]);

    const handleIndexChange = (indexChange: number) => {
        let newIndex = focusedListItem + indexChange;

        if (newIndex > filteredDirectoryFiles.length - 1) {
            newIndex = 0;
        } else if (newIndex < 0) {
            newIndex = filteredDirectoryFiles.length - 1;
        }

        // console.log(newIndex)
        setFocusedListItem(newIndex);

        fileRefs[newIndex].current?.focus();
    };

    const closeMediaViewer = () => {
        // console.log('Closing Media Viewer')
        return setViewerMedia(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
            // case 'Escape':
            //     if (viewerMedia) {
            //         return closeMediaViewer()
            //     }

            //     backDirectory()
            //     break
            // case 'Escape':
            //     if (searchFocused) {
            //         focusList();
            //     }
            //     break;
            case 'f':
                if (!e.ctrlKey) break;
                e.preventDefault();
                searchBarRef.current?.focus();
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                handleIndexChange(-1);
                break;
            case 'ArrowDown':
            case 'ArrowRight':
                handleIndexChange(1);
                break;
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [breadcrumbs, focusedListItem, filteredDirectoryFiles, viewerMedia]);

    useEffect(() => {
        // fetchDirectory();
        setSearchQuery('');
        setSelectedFiles([]);
    }, [directoryId]);

    const uiSizes = [
        {
            name: 'XS',
            value: 'xs',
        },
        {
            name: 'S',
            value: 'sm',
        },
        {
            name: 'M',
            value: 'md',
        },
        {
            name: 'L',
            value: 'lg',
        },
        {
            name: 'XL',
            value: 'xl',
        },
    ];

    const bottomPadding = useMemo(() => {
        return !isMobile ? ' pb-6' : '';
    }, [isMobile]);

    return (
        <div className="flex flex-row flex-nowrap overflow-hidden relative h-screen text-sm">
            {!isMobile ? (
                <div className="bg-white h-12 flex flex-row flex-nowrap items-center absolute top-0 left-0 right-0 z-10 overflow-hidden px-4">
                    <div className="flex flex-row flex-nowrap flex-none">
                        <IconButton
                            icon={mdiChevronLeft}
                            iconSize="24"
                            size="32"
                            onClick={() => navigate(-1)}
                            disabled={!canGoBack}
                        />
                        <IconButton
                            icon={mdiChevronRight}
                            iconSize="24"
                            size="32"
                            onClick={() => navigate(1)}
                            disabled={!canGoForward}
                        />
                        <IconButton
                            icon={mdiArrowUp}
                            iconSize="18"
                            size="32"
                            className="ml-2"
                            onClick={backDirectory}
                            disabled={!breadcrumbs?.length}
                        />
                    </div>
                    <div className="flex flex-row flex-nowrap flex-auto mx-2 px-1 bg-secondary-100 rounded-sm">
                        <div
                            className="flex items-center"
                            onClick={() => {
                                setDirectoryId(null);
                            }}
                        >
                            <IconButton icon={mdiFolder} iconSize="18" size="32" />
                            <IconButton icon={mdiChevronRight} size="18" />
                        </div>

                        {breadcrumbs?.map((breadcrumb, i) => {
                            return (
                                <div
                                    className="flex items-center"
                                    key={breadcrumb.id}
                                    onClick={() => setDirectoryId(breadcrumb.id)}
                                >
                                    <span className="px-2 py-1 cursor-pointer hover:text-primary-500">
                                        {breadcrumb.name}
                                    </span>
                                    {breadcrumbs.length !== i + 1 && <IconButton icon={mdiChevronRight} size="18" />}
                                </div>
                            );
                        })}

                        <IconButton icon={mdiRefresh} iconSize="20" size="32" className="ml-auto" />
                    </div>
                    <SearchBar ref={searchBarRef} value={searchQuery} onChange={(value) => setSearchQuery(value)} />
                </div>
            ) : (
                <FSAppBar
                    breadcrumbs={breadcrumbs}
                    toggleSettings={dotsOnClick}
                    backDirectory={backDirectory}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                />
            )}

            <div
                className={`${
                    isMobile ? 'pt-14' : 'pt-12'
                }${bottomPadding} overflow-hidden relative flex flex-auto inset-0`}
            >
                {!isMobile && <Sidenav breadcrumbs={breadcrumbs} setDirectoryId={setDirectoryId} />}

                <ItemList
                    files={filteredDirectoryFiles}
                    fileRefs={fileRefs}
                    fetching={fetching}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                    setDirectoryId={setDirectoryId}
                    setViewerMedia={setViewerMedia}
                    setFocusedListItem={setFocusedListItem}
                />
            </div>

            {!isMobile && <BottomBar />}

            {/* TODO: Make selected files counter always show on desktop*/}
            {/* {(selectedFiles.length > 0) && (
                <div className="fs-selected-files">{`${selectedFiles.length} / ${directoryFiles.length} items selected`}</div>
            )} */}

            {settingsOpen && (
                <div
                    className="flex flex-col flex-nowrap justify-end absolute inset-0 z-30 bg-secondary-900 bg-opacity-20"
                    onClick={() => setSettingsOpen(false)}
                >
                    <div className="mt-auto bg-white rounded-t-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-row flex-nowrap justify-between p-4 border-b border-secondary-200">
                            <span>Settings</span>
                            <Icon icon={mdiClose} onClick={() => setSettingsOpen(false)} />
                        </div>
                        <div className="p-4">
                            <div className="flex flex-row flex-nowrap items-center mb-4">
                                <span className="flex-auto">Dark Mode</span>
                                <Switch checked={settings.darkMode} onChange={handleDarkModeChange} />
                            </div>
                            <div className="flex flex-row flex-nowrap items-center mb-4">
                                <span className="flex-auto">Flatten single item folders</span>
                                <Switch checked={flattenDepth > 0} onChange={changeFlattenDepth} />
                            </div>

                            <div className="text-base leading-4 font-bold">Display</div>
                            <RadioGroup
                                items={[
                                    {
                                        name: 'Grid',
                                        value: 'grid',
                                    },
                                    {
                                        name: 'Details',
                                        value: 'details',
                                    },
                                ]}
                                value={settings.viewMode}
                                onChange={handleViewModeChange}
                            />
                            {settings.viewMode === 'grid' && (
                                <>
                                    <div className="text-base leading-4 font-bold">Grid Size</div>
                                    <RadioGroup items={uiSizes} value={settings.uiSize} onChange={handleUiSizeChange} />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {!!viewerMedia && <MediaViewer viewerMedia={viewerMedia} setViewerMedia={setViewerMedia} />}
        </div>
    );
};
