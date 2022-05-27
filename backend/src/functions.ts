import { promises as fs } from 'graceful-fs';
import * as path from 'path';

import * as ffmpeg from 'fluent-ffmpeg';

import { BreadCrumb, FsFile, FileOrFolder, FsFolder, TreeFolder, VideoMetadata } from './types';
import type { File } from '.prisma/client';

import { db } from './database/db';
import { __rootdir__ } from './root';
import { generateAudioThumbnail, generateImageThumbnail, generateVideoThumbnail, getFileThumbnail } from './thumbs';
import { orderBy } from 'natural-orderby';

import * as config from '../config.json';

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

    await db.insert({
        id,
        parentId: null,
        path: fixedUrl,
        updated: 0,
    });

    return id;
};

export const getUrlById = async (id: string) => {
    return (await db.getById(id))?.path;
};

export const getBreadcrumbs = async (id?: string): Promise<BreadCrumb[]> => {
    if (!id) return [];

    const files = await db.getBreadcrumbs(id);

    return files;
};

export const getRootDirectoryContents = async () => {
    return await Promise.all(config.rootDirs.map(async (dir) => await getFileInfo(dir)));
};

// export const mapFolders = async (_path: string): Promise<any[] | null> => {
//     if (!_path) return null;

//     const directory = await fs.readdir(_path);

//     // const files = await Promise.all(
//     //     directory
//     //         .filter(async (e) => {
//     //             const dirPath = path.join(_path, e);
//     //             const stat = await fsPromises.lstat(dirPath);

//     //             return stat.isDirectory();
//     //         })
//     //         .map(async (e) => {
//     //             const dirPath = path.join(_path, e);

//     //             const obj = {
//     //                 name: e,
//     //                 id: await getIdByUrl(dirPath),
//     //                 // type: isDirectory ? 'folder' : 'file',
//     //                 folders: await mapFolders(dirPath),
//     //             };

//     //             // if (!isDirectory) obj.size = stat.size

//     //             return obj;
//     //         })
//     // );

//     const files = [];

//     for (let i = 0; i < directory.length; i++) {
//         const e = directory[i];

//         const dirPath = path.join(_path, e);
//         const stat = await fs.lstat(dirPath);
//         if (!stat.isDirectory()) continue;

//         files.push({
//             name: e,
//             id: await getIdByUrl(dirPath),
//             folders: await mapFolders(dirPath),
//         });
//     }

//     return files.filter(Boolean);
// };

export const getFileParents = async (id?: string) => {
    const files = await getBreadcrumbs(id);

    type FolderData = {
        parentId: string;
        folders: FsFolder[];
    };

    const generateTree = (elements: FolderData[]) => {
        // console.log(elements);
        if (!elements.length) return [];
        const element = elements[0];

        const data = element.folders.map((e) => {
            const data: TreeFolder = {
                name: e.name,
                id: e.id,
                childCount: e.fileCount.folder,
            };

            if (e.id === elements[1]?.parentId && elements[1].folders.length) {
                data.children = generateTree(elements.slice(1));
            }

            return data;
        });

        return data;
    };

    const folderData: FolderData[] = [];

    for (let i = 0; i < files.length; i++) {
        const dir = files[i];
        const elements = (await getDirFiles(dir.id)).filter((e) => e.directory) as FsFolder[];

        // console.log(dir.id, elements);

        folderData.push({
            parentId: dir.id,
            folders: elements,
        });
    }

    const tree = generateTree(folderData);

    console.log('files', files);

    // Append folders to root directory
    const root = ((await getRootDirectoryContents()).filter((e) => e.directory) as FsFolder[]).map((e) => {
        const item: TreeFolder = {
            name: e.name,
            id: e.id,
            childCount: e.fileCount.total,
        };

        if (e.id === files[0]?.id) {
            item.children = tree;
        }

        return item;
    });

    // console.log(JSON.stringify(root, null, 2));

    return root;
};

export const mapDirectory = async (dirPath: string, filesInDir: any[], flatten?: number): Promise<FileOrFolder[]> => {
    const files = await getDirFiles(dirPath);

    return files;
};

export const getDirFiles = async (id: string, forceUpdate: boolean = false) => {
    const dbEntries = await updateDir(id);

    const CONCURRENT_ITEMS = 10;

    let files: FileOrFolder[] = [];

    let low = 0;
    while (low < dbEntries.length) {
        const high = Math.min(low + CONCURRENT_ITEMS, dbEntries.length);
        const newFiles = await Promise.all(dbEntries.slice(low, high).map(async (e) => await getFileInfo(e.path)));

        files = [...files, ...newFiles];
        low += CONCURRENT_ITEMS;
    }

    return files;
};

/**
 * Updates a directory's content and returns it
 * @param id Id of the directory
 * @returns List of items in the directory
 */
const updateDir = async (id: string) => {
    // TODO: Do this all in as few transactions as possible
    const now = Date.now();
    const TIME_DELTA = 10000; // 10 seconds

    const curDirDbE = await db.getById(id);

    // TODO: Recursively map folders to db
    if (!curDirDbE) return [];

    if (curDirDbE.updated && curDirDbE.updated > now - TIME_DELTA) {
        console.log('Fetched from database');
        return await db.getChildren(curDirDbE.id);
    }

    const filePaths = (await fs.readdir(curDirDbE.path)).map((f) => path.join(curDirDbE.path, f).replace(/\\/g, '/'));

    // console.log('filePaths', filePaths);

    const oldEntries = await db.getMultipleByUrl(filePaths);

    // console.log('oldEntries', oldEntries);

    const deletedFiles = (await db.getChildren(curDirDbE.id)).filter((dbE) => !filePaths.some((e) => e === dbE.path));

    // console.log('deletedFiles', deletedFiles);

    if (deletedFiles.length) {
        db.deleteManyById(deletedFiles.map((e) => e.id));
    }

    const filesNotInDb = filePaths.filter((fp) => !oldEntries.some((e) => e.path === fp));

    const newEntries = (await db.generateIds(filesNotInDb, 8)).map((e) => {
        e.parentId = curDirDbE.id;
        console.log(e);
        return e;
    });

    console.log('newEntries', newEntries);

    if (newEntries.length) {
        await db.insertMany(newEntries);
    }

    db.setUpdateTimestamp(curDirDbE.id, now);

    const items = orderBy([...oldEntries, ...newEntries], [(v: File) => v.path]);

    return items;
};

/**
 * Get file info
 * @param filePath Path to the file
 * @returns File info
 */
export const getFileInfo = async (filePath: string) => {
    const fileName = path.basename(filePath);

    // if (!fileName) {
    //     filePath = dirPath;
    //     fileName = dirPath.split('/').filter(Boolean).pop()!.trim();
    // } else {
    //     filePath = path.join(dirPath, fileName);
    // }

    const stat = await fs.lstat(filePath);

    const isDirectory = stat.isDirectory();

    console.log(filePath);
    const id = await getIdByUrl(filePath);

    if (!isDirectory) {
        const item: FsFile = {
            name: fileName,
            id,
            directory: false,
            size: stat.size,
            contentType: getFileType(fileName),
        };

        if (!isDirectory && item.contentType) {
            try {
                item.hasThumb = await getFileThumbnail(id);

                // if (isVideoFile(filePath)) {
                //     try {
                //         item.metadata = await getVideoMetadata(filePath);
                //     } catch (err) {
                //         console.log(err);
                //     }
                // }

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
        const filesInDirectory = await fs.readdir(filePath);
        const childData = { file: 0, folder: 0, total: 0 };

        for (let i = 0; i < filesInDirectory.length; i++) {
            const element = filesInDirectory[i];
            const stat = await fs.lstat(path.join(filePath, element));

            if (stat.isDirectory()) {
                childData.folder++;
            } else {
                childData.file++;
            }
            childData.total++;
        }

        const item: FsFolder = {
            name: fileName,
            id,
            directory: true,
            fileCount: childData,
        };

        return item;
    }
};
