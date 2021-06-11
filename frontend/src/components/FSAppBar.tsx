import { useEffect, useState, useRef } from 'react';

import { mdiArrowLeft, mdiMenu, mdiClose, mdiMagnify, mdiDotsVertical, mdiLinkVariant, mdiDownload } from '@mdi/js';

import { Icon } from './Icon';
import { AppBar } from './AppBar';
import { copyToClipboard } from '../Utils';

type Props = {
    breadcrumbs: any;
    toggleSettings: () => void;
    backDirectory: () => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedFiles: string[];
    setSelectedFiles: React.Dispatch<React.SetStateAction<string[]>>;
}

// TODO: Close Search with back button (impossible?)
const FSAppBar = ({ breadcrumbs, toggleSettings, backDirectory, searchQuery, setSearchQuery, selectedFiles, setSelectedFiles }: Props) => {

    const searchBarRef = useRef<HTMLInputElement>(null);

    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        if (searchOpen) {
            return searchBarRef.current?.focus();
        }
    }, [searchOpen]);

    useEffect(() => {
        if (searchOpen) {
            return setSearchOpen(false);
        }
    }, [breadcrumbs]);

    const searchIconAction = (e: React.MouseEvent) => {
        if (searchOpen) {
            setSearchQuery('');
            return searchBarRef.current?.focus();
        }

        return setSearchOpen(true);
    };

    const menuIconAction = (e: React.MouseEvent) => {
        if (searchOpen) {
            setSearchQuery('');
            return setSearchOpen(false);
        }

        return backDirectory();
    };

    const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };



    if (selectedFiles && selectedFiles.length > 0) {
        return (
            <AppBar>
                <AppBar.IconButton onClick={() => setSelectedFiles([])}>
                    <Icon icon={mdiClose} />
                </AppBar.IconButton>

                <AppBar.Title>{`${selectedFiles.length} item${selectedFiles.length > 1 ? 's' : ''}`}</AppBar.Title>

                {selectedFiles.length === 1 && (
                    <>
                        <AppBar.IconButton style={{ marginLeft: 'auto', marginRight: 16 }} onClick={() => {
                            window.open('http://192.168.1.106:3000/api/fs/file/' + selectedFiles[0] + '/download');
                        }}>
                            <Icon icon={mdiDownload} />
                        </AppBar.IconButton>

                        <AppBar.IconButton onClick={() =>
                            copyToClipboard('http://192.168.1.106:3000/api/fs/file/' + selectedFiles[0])
                        }>
                            <Icon icon={mdiLinkVariant} />
                        </AppBar.IconButton>
                    </>
                )}
            </AppBar>
        );
    }

    return (
        <AppBar>
            <AppBar.IconButton onClick={menuIconAction}>
                <Icon icon={!!breadcrumbs.length || searchOpen ? mdiArrowLeft : mdiMenu} />
            </AppBar.IconButton>

            {searchOpen ? (
                <input
                    ref={searchBarRef}
                    type="text"
                    className="searchField"
                    placeholder="Search something"
                    value={searchQuery}
                    onChange={inputOnChange}
                />
            ) : (
                <AppBar.Title>{breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : 'Files'}</AppBar.Title>
            )
            }

            {(!searchOpen || (searchOpen && searchQuery !== '')) && (

                <AppBar.IconButton onClick={searchIconAction}>
                    <Icon icon={searchOpen ? mdiClose : mdiMagnify} />
                </AppBar.IconButton>
            )}

            {!searchOpen && (
                <AppBar.IconButton className="dotsIcon" onClick={toggleSettings}>
                    <Icon icon={mdiDotsVertical} />
                </AppBar.IconButton>
            )}
        </AppBar>
    );
};

export { FSAppBar };