import { promises as fsPromises } from 'graceful-fs';
import * as path from 'path';

import * as ffmpeg from 'fluent-ffmpeg';

import { DbEntry, File, VideoMetadata } from './types';

import { db, knex } from './db';
import { __rootdir__ } from './root';
import { generateImageThumbnail, generateVideoThumbnail, getFileThumbnail } from './thumbs';
import { orderBy } from 'natural-orderby';

export const DIRECTORIES = [
    {
        drive: 'E',
        folder: 'Voice'
    },
    {
        drive: 'E',
        folder: 'Torrent'
    },
    {
        drive: 'E',
        folder: 'Music'
    }
];

const EXTENSIONS: {
    [s: string]: string[];
} = {
    AUDIO: ['mp3', 'wav'],
    VIDEO: ['avi', 'mkv', 'mp4', 'm4v', 'ts', 'webm'], // TS is also a video file format
    IMAGE: ['gif', 'jpg', 'jpeg', 'png']
};

const isFileType = (file: string, type: string) => {
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
                        // TODO: Change if else to for loop
                        if (stream.tags && stream.tags.DURATION && typeof stream.tags.DURATION === 'string') {
                            const timestamp = (stream.tags.DURATION.split('.'))[0];
                            duration = timestamp.split(':').reduce((prev: number, cur: any, i: number, arr: any[]) => {
                                return prev + +cur * Math.pow(60, (arr.length - 1) - i);
                            }, 0);
                        } else if (stream.tags && stream.tags.DURATION && typeof stream.tags['DURATION-eng'] === 'string') {
                            const timestamp = (stream.tags['DURATION-eng'].split('.'))[0];
                            duration = timestamp.split(':').reduce((prev, cur, i, arr) => {
                                return prev + +cur * Math.pow(60, (arr.length - 1) - i);
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
                duration
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
            breadcrumbs: []
        };
    }

    let dir;
    let selectedPath;

    // console.log('pathId', pathId)

    const _path = await getUrlById(id);

    if (!_path) throw new Error();

    for (let i = 0; i < DIRECTORIES.length; i++) {

        const basePath = `${DIRECTORIES[i].drive}:/${DIRECTORIES[i].folder}`;

        if (_path.startsWith(basePath)) {
            dir = `${DIRECTORIES[i].drive}:/`;
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
                name: pathSegments[i]
            });
        } else {
            throw new Error();
        }
    }

    return {
        dir: dir.replace(/\\/g, '/'),
        breadcrumbs: folders
    };
};

export const mapFolders = async (_path: string): Promise<any[] | null> => {
    if (!_path) return null;

    // const directories = []

    const directory = await fsPromises.readdir(_path);

    const files = await Promise.all(
        directory.map(async (e) => {
            const dirPath = path.join(_path, e);
            const stat = await fsPromises.lstat(dirPath);

            const isDirectory = stat.isDirectory();
            if (!isDirectory) return null;

            const obj = {
                name: e,
                id: await getIdByUrl(dirPath),
                // type: isDirectory ? 'folder' : 'file',
                folders: await mapFolders(dirPath)
            };

            // if (!isDirectory) obj.size = stat.size

            return obj;
        }).filter(Boolean)
    );

    // console.log(files);

    return files.filter(Boolean);
};

export const mapDirectory = async (dirPath: string, filesInDir: any[], flatten?: number): Promise<File[]> => {
    const files = await getDirFiles(dirPath);

    return files;

    // const files = await filesInDir.reduce(async (outputArr: File[] | Promise<File[]>, fileName: string, i) => {
    //     const fileWithInfo = await fileInfo(dirPath, fileName, flatten);

    //     const fileArr = await outputArr;

    //     try {
    //         if (Array.isArray(fileWithInfo)) {
    //             return [...fileArr, ...fileWithInfo];
    //         } else {
    //             return [...fileArr, fileWithInfo];
    //         }
    //     } catch (err) {
    //         console.log(err);
    //     }

    //     return [];
    // }, []);

    // return files;
};

export const getDirFiles = async (dir: string, forceUpdate: boolean = false) => {
    forceUpdate = true; // for now
    const parent = await knex<DbEntry>('files')
        .select('*')
        .where('url', dir)
        .first();

    if (!parent) return [];

    if (!forceUpdate) {
        try {
            // const dbEntries = await knex<DbEntry>('files AS parent')
            //     .select('parent.*')
            //     .where('parent.url', dir)
            //     .first()
            //     .join('files', 'parent.id', '=', 'files.parent');

            const dbEntries: DbEntry[] = await knex<DbEntry>('files')
                .select('*')
                .where('parent', parent.id);

            if (dbEntries.length) {
                console.log(dbEntries);
                const files = await Promise.all(dbEntries.map(async (e) => await fileInfo(e.url)));
                return files;
            }

        } catch (err) {
            console.log(err);
        }
    }


    const filePaths = (await fsPromises.readdir(dir))
        .map((f) =>
            path.join(dir, f)
                .replace(/\\/g, '/')
        );


    // console.log('filePaths');
    // console.log(filePaths);

    const oldEntries = await db.getMultipleByUrl(filePaths);

    // console.log('oldEntries');
    // console.log(oldEntries);

    const filesNotInDb = filePaths
        .filter((fp) =>
            !oldEntries.some((e) => e.url === fp)
        );

    const newEntries = (await db.generateIds(filesNotInDb, 8))
        .map((e) => {
            e.parent = parent.id;
            return e;
        });

    // console.log('newEntries');
    // console.log(newEntries);

    if (newEntries.length) {
        await db.insertMany(newEntries);
    }

    const items = orderBy(
        [...oldEntries, ...newEntries],
        [(v: DbEntry) => v.url]
    );

    const files = await Promise.all(items.map(async (e) => await fileInfo(e.url)));

    return files;
};

export const fileInfo = async (dirPath: string, fileName?: string, flatten = 0) => {
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

    const item: File = {
        name: fileName,
        id: id,
        isDirectory,
        size: stat.size,
        // devino: `${stat.dev}${stat.ino}`
    };

    if (!isDirectory && (isVideoFile(filePath) || isImageFile(filePath))) {
        try {
            item.hasThumb = await getFileThumbnail(id);

            if (isVideoFile(filePath)) {
                try {
                    item.metadata = await getVideoMetadata(filePath);
                } catch (err) {
                    console.log(err);
                }
            }

            // TODO: Queue for thumbnail creation to not destroy server performance
            // Generate thumbnail
            if (!item.hasThumb && isVideoFile(filePath)) {
                item.hasThumb = await generateVideoThumbnail(filePath, id);
            } else if (isImageFile(filePath)) {
                item.hasThumb = await generateImageThumbnail(filePath, id);
            }

        } catch (err) {
            // console.log(err)
        }
    }

    if (isDirectory) {
        const filesInDirectory = await fsPromises.readdir(filePath);

        // if (flatten > 0) {
        //     // console.log('x')
        //     // files.flat()
        //     return await mapDirectory(filePath, filesInDirectory, flatten - 1);
        // }

        item.fileCount = filesInDirectory.length;
    }

    return item;
};
