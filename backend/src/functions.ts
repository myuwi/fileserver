import { promises as fsPromises } from 'graceful-fs';
import * as path from 'path';

import * as ffmpeg from 'fluent-ffmpeg';

import { DbEntry, File, FileOrFolder, Folder, VideoMetadata } from './types';

import { db, knex } from './database/db';
import { __rootdir__ } from './root';
import { generateAudioThumbnail, generateImageThumbnail, generateVideoThumbnail, getFileThumbnail } from './thumbs';
import { orderBy } from 'natural-orderby';
export const DIRECTORIES: { base: string; folder: string }[] = [
    {
        base: '/hdd1/',
        folder: 'Torrent',
    },
    {
        base: '/hdd1/',
        folder: 'Voice',
    },
];

import { EXTENSIONS } from './constants';

const isFileType = (file: string, type: keyof typeof EXTENSIONS) => {
    const extension = file.split('.').pop()!.trim().toLowerCase();
    if (!extension) return false;

    const fileExtensions = EXTENSIONS[type];

    for (let i = 0; i < fileExtensions.length; i++) {
        if (extension.endsWith(fileExtensions[i])) return true;
    }

    return false;
};

export const isAudioFile = (file: string) => isFileType(file, 'AUDIO');

export const isVideoFile = (file: string) => isFileType(file, 'VIDEO');

export const isImageFile = (file: string) => isFileType(file, 'IMAGE');

export const getFileType = (file: string) => {
    if (isVideoFile(file)) {
        return 'video';
    } else if (isAudioFile(file)) {
        return 'audio';
    } else if (isImageFile(file)) {
        return 'image';
    }

    return undefined;
};

export const getVideoMetadata = (filePath: string) => {
    return new Promise<VideoMetadata>((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) return reject({ error: err, file: filePath });

            let audioCodec;
            let videoCodec;
            let duration;

            metadata.streams.forEach((stream) => {
                if (stream.codec_type === 'video') {
                    videoCodec = stream.codec_name;
                    // console.log(stream)

                    if (stream.duration && stream.duration !== 'N/A') {
                        duration = ~~stream.duration;
                    } else {
                        // Convert HH:mm:ss to seconds
                        if (stream.tags && stream.tags.DURATION && typeof stream.tags.DURATION === 'string') {
                            const timestamp = stream.tags.DURATION.split('.')[0];
                            duration = timestamp.split(':').reduce((prev: number, cur: any, i: number, arr: any[]) => {
                                return prev + +cur * Math.pow(60, arr.length - 1 - i);
                            }, 0);
                        } else if (
                            stream.tags &&
                            stream.tags.DURATION &&
                            typeof stream.tags['DURATION-eng'] === 'string'
                        ) {
                            const timestamp = stream.tags['DURATION-eng'].split('.')[0];
                            duration = timestamp.split(':').reduce((prev, cur, i, arr) => {
                                return prev + +cur * Math.pow(60, arr.length - 1 - i);
                            }, 0);
                        }
                    }
                } else if (stream.codec_type === 'audio') {
                    audioCodec = stream.codec_name;
                }
            });

            return resolve({
                audioCodec,
                videoCodec,
                duration,
            });
        });
    });
};

export const getIdByUrl = async (url: string) => {
    const fixedUrl = url.replace(/\\/g, '/');

    const fromDb = await db.getByUrl(fixedUrl);

    if (fromDb && fromDb.id) return fromDb.id;

    const id = await db.generateUniqueId(8);

    await db.insert({ id, url: fixedUrl });

    return id;
};

export const getUrlById = async (id: string) => {
    return (await db.getById(id))?.url;
};

export const resolvePath = async (id?: string) => {
    // Return Root in a scuffed way
    if (!id) {
        return {
            dir: 'ROOT',
            breadcrumbs: [],
        };
    }

    let dir;
    let selectedPath;

    // console.log('pathId', pathId)

    const _path = await getUrlById(id);

    if (!_path) throw new Error();

    for (let i = 0; i < DIRECTORIES.length; i++) {
        const basePath = `${DIRECTORIES[i].base}${DIRECTORIES[i].folder}`;

        if (_path.startsWith(basePath)) {
            dir = `${DIRECTORIES[i].base}`;
            selectedPath = _path.substring(dir.length);
            break;
        }
    }

    if (!dir || !selectedPath) throw new Error();

    const pathSegments = selectedPath.replace(/\\/g, '/').split('/').filter(Boolean);
    // console.log('pathSegments', pathSegments)

    const folders = [];

    for (let i = 0; i < pathSegments.length; i++) {
        const files = await fsPromises.readdir(dir);

        if (files.includes(pathSegments[i])) {
            dir = path.join(dir, pathSegments[i]);
            // console.log('resolvePath loop dir:', path.join(dir))

            const filePath = dir;
            const id = await getIdByUrl(filePath);
            folders.push({
                id,
                name: pathSegments[i],
            });
        } else {
            throw new Error();
        }
    }

    return {
        dir: dir.replace(/\\/g, '/'),
        breadcrumbs: folders,
    };
};

export const mapFolders = async (_path: string): Promise<any[] | null> => {
    if (!_path) return null;

    const directory = await fsPromises.readdir(_path);

    // const files = await Promise.all(
    //     directory
    //         .filter(async (e) => {
    //             const dirPath = path.join(_path, e);
    //             const stat = await fsPromises.lstat(dirPath);

    //             return stat.isDirectory();
    //         })
    //         .map(async (e) => {
    //             const dirPath = path.join(_path, e);

    //             const obj = {
    //                 name: e,
    //                 id: await getIdByUrl(dirPath),
    //                 // type: isDirectory ? 'folder' : 'file',
    //                 folders: await mapFolders(dirPath),
    //             };

    //             // if (!isDirectory) obj.size = stat.size

    //             return obj;
    //         })
    // );

    const files = [];

    for (let i = 0; i < directory.length; i++) {
        const e = directory[i];

        const dirPath = path.join(_path, e);
        const stat = await fsPromises.lstat(dirPath);
        if (!stat.isDirectory()) continue;

        files.push({
            name: e,
            id: await getIdByUrl(dirPath),
            folders: await mapFolders(dirPath),
        });
    }

    return files.filter(Boolean);
};

export const mapDirectory = async (dirPath: string, filesInDir: any[], flatten?: number): Promise<FileOrFolder[]> => {
    const files = await getDirFiles(dirPath);

    return files;
};

export const getDirFiles = async (dirPath: string, forceUpdate: boolean = false) => {
    // forceUpdate = true; // for now

    // if (!forceUpdate) {
    //     try {
    //         // const dbEntries = await knex<DbEntry>('files AS parent')
    //         //     .select('parent.*')
    //         //     .where('parent.url', dir)
    //         //     .first()
    //         //     .join('files', 'parent.id', '=', 'files.parent');

    //         const dbEntries: DbEntry[] = await knex<DbEntry>('files')
    //             .select('*')
    //             .where('parent', curDirDbE.id);

    //         if (dbEntries.length) {
    //             console.log(dbEntries);
    //             const files = await Promise.all(dbEntries.map(async (e) => await fileInfo(e.url)));
    //             return files;
    //         }

    //     } catch (err) {
    //         console.log(err);
    //     }
    // }

    return await updateDir(dirPath);
};

/**
 * Updates a directory's content and returns it
 * @param dirPath Path to directory
 * @returns List of items in the directory
 */
const updateDir = async (dirPath: string) => {
    const curDirDbE = await knex<DbEntry>('files').select('*').where('url', dirPath).first();

    // TODO: Recursively map folders to db
    if (!curDirDbE) return [];

    const filePaths = (await fsPromises.readdir(dirPath)).map((f) => path.join(dirPath, f).replace(/\\/g, '/'));

    // console.log('filePaths', filePaths);

    const oldEntries = await db.getMultipleByUrl(filePaths);

    // console.log('oldEntries', oldEntries);

    const deletedFiles = (await db.getChildren(curDirDbE.id)).filter((dbE) => !filePaths.some((e) => e === dbE.url));

    // console.log('deletedFiles', deletedFiles);

    // TODO: Implement this better
    // db.deleteManyById(deletedFiles.map((e) => e.id));

    const filesNotInDb = filePaths.filter((fp) => !oldEntries.some((e) => e.url === fp));

    const newEntries = (await db.generateIds(filesNotInDb, 8)).map((e) => {
        e.parent = curDirDbE.id;
        return e;
    });

    // console.log('newEntries', newEntries);

    if (newEntries.length) {
        await db.insertMany(newEntries);
    }

    const items = orderBy([...oldEntries, ...newEntries], [(v: DbEntry) => v.url]);

    const CONCURRENT_ITEMS = 10;

    let files: FileOrFolder[] = [];

    let low = 0;
    while (low < items.length) {
        const high = Math.min(low + CONCURRENT_ITEMS, items.length);
        const newFiles = await Promise.all(items.slice(low, high).map(async (e) => await fileInfo(e.url)));

        files = [...files, ...newFiles];
        low += CONCURRENT_ITEMS;
    }

    // const files = await Promise.all(items.map(async (e) => await fileInfo(e.url)));

    return files;
};

export const fileInfo = async (dirPath: string, fileName?: string) => {
    let filePath;

    if (!fileName) {
        filePath = dirPath;
        fileName = dirPath.split('/').filter(Boolean).pop()!.trim();
    } else {
        filePath = path.join(dirPath, fileName);
    }

    const stat = await fsPromises.lstat(filePath);

    const isDirectory = stat.isDirectory();

    const id = await getIdByUrl(filePath);

    if (!isDirectory) {
        const item: File = {
            name: fileName,
            id,
            type: 'FILE',
            size: stat.size,
            contentType: getFileType(fileName),
        };

        if (!isDirectory && item.contentType) {
            try {
                item.hasThumb = await getFileThumbnail(id);

                if (isVideoFile(filePath)) {
                    try {
                        item.metadata = await getVideoMetadata(filePath);
                    } catch (err) {
                        console.log(err);
                    }
                }

                // Generate thumbnail
                if (!item.hasThumb) {
                    switch (item.contentType) {
                        case 'audio':
                            item.hasThumb = await generateAudioThumbnail(filePath, id);
                            break;
                        case 'image':
                            item.hasThumb = await generateImageThumbnail(filePath, id);
                            break;
                        case 'video':
                            item.hasThumb = await generateVideoThumbnail(filePath, id);
                            break;
                    }
                }
            } catch (err) {
                // console.log(err)
            }
        }

        return item;
    } else {
        const filesInDirectory = await fsPromises.readdir(filePath);
        const item: Folder = {
            name: fileName,
            id,
            type: 'FOLDER',
            fileCount: filesInDirectory.length,
        };

        return item;
    }
};
