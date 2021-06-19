import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import Axios from 'axios';

import { FsFile, ViewerMedia } from '../types';

import { mdiClose, mdiChevronRight, mdiChevronLeft, mdiFolder, mdiArrowUp, mdiRefresh } from '@mdi/js';

import classNames from 'classnames';
import { useCustomHistory } from '../hooks/useCustomHistory';
import { useMobile } from '../context/MobileProvider';

import { SearchBar } from '../components/SearchBar';
import { Switch } from '../components/Switch';
import { RadioGroup } from '../components/RadioGroup';

import { FSAppBar } from '../components/FSAppBar';
import { FSMediaViewer } from '../components/FSMediaViewer';
import { FSSidenav } from '../components/FSSidenav';
import { FSItemList } from '../components/FSItemList';

import { IconButton } from '../components/IconButton';
import { Icon } from '../components/Icon';

import { LOGGER } from '../LOGGER';

import createPersistedState from 'use-persisted-state';
import { FSBottomBar } from '../components/FSBottomBar';

const useDarkMode = createPersistedState('darkMode');
const useUiSize = createPersistedState('uiSize');
const useListMode = createPersistedState('listMode');


// TODO: Split stuff to separate components
// TODO: Context menu
// TODO: Settings
// TODO: Change document title based on Media

type ParamTypes = {
    id: string;
}

type LocationStateTypes = {
    mediaOpen: boolean;
}

const FileSystem = () => {
    const isMobile = useMobile();

    // TODO: Convert to a hook
    const [folders, setFolders] = useState(null);
    const [directoryFiles, setDirectoryFiles] = useState<FsFile[]>([]);
    const [fetching, setFetching] = useState<boolean>(false);
    const [filteredDirectoryFiles, setFilteredDirectoryFiles] = useState<FsFile[]>([]);

    const firstRender = useRef(true);

    const [fileRefs, setFileRefs] = useState<React.RefObject<HTMLDivElement>[]>([]);

    const [focusedListItem, setFocusedListItem] = useState(0);

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [flattenDepth, setFlattenDepth] = useState(0);

    const [uiSize, setUiSize] = useUiSize('m');
    const [darkMode, setDarkMode] = useDarkMode(false);
    const [listEnabled, setListEnabled] = useListMode(false);

    const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);

    // TODO: Selected File Info
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [viewerMedia, setViewerMedia] = useState<ViewerMedia | null>(null);

    const history = useHistory();

    const params = useParams<ParamTypes>();
    const directoryId = params.id;

    const location = useLocation<LocationStateTypes>();

    const collator = new Intl.Collator('fi', { numeric: true, sensitivity: 'base' });

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
                history.replace(location.pathname);
            }

        } else {
            if (viewerMedia) {
                history.push(location.pathname, { mediaOpen: true });
            } else if (!viewerMedia && location.state && location.state.mediaOpen) {
                history.goBack();
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

    const setDirectoryId = (id: string) => {
        // console.log(id)
        if (!id) {
            return history.push('');
        }

        history.push(`/${id}`);
    };

    const fetchFolders = async () => {
        const folders = await Axios.get('/api/folders').then((res) => res.data);
        LOGGER.debug(folders);

        setFolders(folders.sort((a: any, b: any) => collator.compare(a.name, b.name)));
    };

    const fetchDirectory = async () => {
        setFetching(true);
        setDirectoryFiles([]);
        let url = '/api/dir';

        const paramsArr = [];

        // console.log(directoryId)

        if (directoryId) url += `/${directoryId}`;
        if (flattenDepth > 0) paramsArr.push(`flatten=${flattenDepth}`);

        if (paramsArr.length > 0) url += `?${paramsArr.join('&')}`;

        // console.log(url)
        try {
            const dir = await Axios.get(url).then((res) => res.data);

            LOGGER.debug(dir);

            const files = filterFiles(dir.files);

            setBreadcrumbs(dir.breadcrumbs);
            setDirectoryFiles(dir.files);
            setFilteredDirectoryFiles(files);
            setFetching(false);
        } catch (err) {
            // if (err.response.status === 404) return setDirectoryId(null)

            // TODO: Make proper error messages
            setDirectoryFiles([]);
            setFetching(false);
            console.log(err.response);
        }
    };

    const backDirectory = () => {
        // console.log('breadcrumbs', breadcrumbs)
        // console.log('Back Directory')

        if (breadcrumbs.length <= 0) return;

        if (breadcrumbs.length <= 1) {
            return setDirectoryId('');
        }

        // console.log(breadcrumbs[breadcrumbs.length - 2].id)
        setDirectoryId(breadcrumbs[breadcrumbs.length - 2].id);
    };

    const dotsOnClick = () => {
        // console.log('dots clicked')
        setSettingsOpen(!settingsOpen);
    };

    const handleUiSizeChange = (e: any) => {
        // console.log(e)
        setUiSize(e);
    };

    const changeFlattenDepth = () => {
        setFlattenDepth(flattenDepth > 0 ? 0 : 1);
    };

    const filterFiles = (files: FsFile[]) => {
        const filteredFiles = files
            .filter((file: FsFile) => {
                if (!searchQuery || searchQuery === '') return true;

                const words = searchQuery.toLowerCase().split(' ');

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
            .sort((a: FsFile, b: FsFile) => {
                if (a.isDirectory && !b.isDirectory) {
                    return -1;
                }
                if (!a.isDirectory && b.isDirectory) {
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
        if (!directoryFiles) return setFilteredDirectoryFiles([]);

        const files = filterFiles(directoryFiles);

        setFilteredDirectoryFiles(files);
    }, [searchQuery]);


    const handleIndexChange = (indexChange: number) => {
        let newIndex = focusedListItem + indexChange;

        if (newIndex > (filteredDirectoryFiles.length - 1)) {
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

    const handleKeyDown = (e: any) => {
        switch (e.key) {
            // case 'Escape':
            //     if (viewerMedia) {
            //         return closeMediaViewer()
            //     }

            //     backDirectory()
            //     break
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
        // if (!isMobile) fetchFolders();
        fetchDirectory();
        setSearchQuery('');
        setSelectedFiles([]);
    }, [directoryId, flattenDepth]);


    const uiSizes = [
        {
            name: 'XS',
            value: 'xs'
        },
        {
            name: 'S',
            value: 's'
        },
        {
            name: 'M',
            value: 'm'
        },
        {
            name: 'L',
            value: 'l'
        },
        {
            name: 'XL',
            value: 'xl'
        }
    ];

    const fsClasses = classNames({
        fs: true,
        mobile: isMobile
    });

    return (
        <div className={fsClasses}>
            {!isMobile ? (
                <div className="fs-itemlist-controls">
                    <div className="arrows">
                        <IconButton icon={mdiChevronLeft} onClick={() => history.goBack()} disabled={!canGoBack} />
                        <IconButton icon={mdiChevronRight} onClick={() => history.goForward()} disabled={!canGoForward} />
                        <IconButton className="up" icon={mdiArrowUp} onClick={backDirectory} disabled={!breadcrumbs.length} />
                    </div>
                    <div className="fm-breadcrumbs">
                        <div className="fs-breadcrumb" onClick={() => { setDirectoryId(''); }}>
                            <Icon className="cloud" icon={mdiFolder} />
                            <Icon icon={mdiChevronRight} />
                        </div>

                        {breadcrumbs.map((breadcrumb: any) => {
                            return (
                                <div className="fs-breadcrumb" key={breadcrumb.id} onClick={() => setDirectoryId(breadcrumb.id)}>
                                    <span>{breadcrumb.name}</span>
                                    <Icon icon={mdiChevronRight} />
                                </div>
                            );
                        })}

                        <Icon icon={mdiRefresh} className="refresh" />
                    </div>
                    <SearchBar value={searchQuery} onChange={(value) => setSearchQuery(value)} />
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

            <div className="fs-main">

                {!isMobile && (
                    <FSSidenav breadcrumbs={breadcrumbs} folders={folders} setDirectoryId={setDirectoryId} />
                )}

                <FSItemList
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

            {!isMobile && (
                <FSBottomBar list={listEnabled} setList={setListEnabled} />
            )}

            {/* TODO: Make selected files counter always show on desktop*/}
            {/* {(selectedFiles.length > 0) && (
                    <div className="fs-selected-files">{`${selectedFiles.length} / ${directoryFiles.length} items selected`}</div>
                )} */}

            {settingsOpen && (
                <div className="fs-settings-bg" onClick={() => setSettingsOpen(false)}>
                    <div className="fs-settings" onClick={(e) => e.stopPropagation()}>
                        <div className="title">
                            <span>Settings</span>
                            <Icon icon={mdiClose} onClick={() => setSettingsOpen(false)} />
                        </div>
                        <div className="settings">
                            <div className="setting">
                                <span>Dark Mode</span>
                                <Switch checked={darkMode} onChange={setDarkMode} />
                            </div>
                            <div className="setting">
                                <span>Flatten single item folders</span>
                                <Switch checked={flattenDepth > 0} onChange={changeFlattenDepth} />
                            </div>

                            <div className="settings-title">Display</div>
                            <RadioGroup items={[{
                                name: 'Grid',
                                value: false
                            }, {
                                name: 'List',
                                value: true
                            }]} value={listEnabled} onChange={setListEnabled} />

                            <div className="settings-title">Grid Options</div>
                            <RadioGroup items={uiSizes} value={uiSize} onChange={handleUiSizeChange} />
                        </div>
                    </div>
                </div>
            )}

            {viewerMedia && (
                <FSMediaViewer viewerMedia={viewerMedia} setViewerMedia={setViewerMedia} />
            )}
        </div>
    );
};

export { FileSystem };
