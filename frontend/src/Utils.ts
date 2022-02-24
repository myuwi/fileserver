import { FileOrFolder } from './types';

export const collator = new Intl.Collator('fi', { numeric: true, sensitivity: 'base' });

export const copyToClipboard = (str: string) => {
    const elem = document.createElement('textarea');
    elem.style.position = 'fixed';
    elem.style.opacity = '0';
    elem.style.pointerEvents = 'none';
    elem.value = str;
    document.body.appendChild(elem);
    elem.select();
    document.execCommand('copy');
    document.body.removeChild(elem);
};

export const getTypeOf = (item: FileOrFolder) => {
    if (item.directory) return 'Folder';

    const extension = item.name.split('.').pop()?.trim().toLowerCase();

    if (!extension) return undefined;

    switch (extension) {
        case 'gif':
        case 'jpg':
        case 'jpeg':
        case 'png':
            return 'Image';
        case 'avi':
        case 'mkv':
        case 'mp4':
        case 'm4v':
        case 'webm':
            return 'Video';
        case 'm4a':
        case 'mp3':
        case 'wav':
            return 'Audio';
        default:
            return undefined;
    }
};
