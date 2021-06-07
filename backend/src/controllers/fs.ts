import * as fs from 'graceful-fs';
const fsPromises = fs.promises;

import { Request, Response } from 'express';

import {
    getIdByUrl,
    getUrlById,
    resolvePath,
    mapFolders,
    isAudioFile,
    isImageFile,
    isVideoFile,
    fileInfo,
    mapDirectory,
    DIRECTORIES
} from '../functions';

import { isNumeric } from '../util';

export const directory = async (req: Request, res: Response) => {
    const reqDir = req.query.dir;
    const flattenDepth = req.query.flatten;

    let pathInfo;
    try {
        pathInfo = await resolvePath(typeof reqDir === 'string' ? reqDir : undefined);
    } catch (err) {
        return res.status(404).json({
            message: 'Invalid path'
        });
    }

    const { dir, breadcrumbs } = pathInfo;

    if (dir === 'ROOT') {
        const files = await Promise.all(
            DIRECTORIES.map(async (dirObj: any) => {
                const pathToDir = `${dirObj.drive}:/${dirObj.folder}`;
                return await fileInfo(pathToDir);
            })
        );

        return res.status(200).json({
            breadcrumbs,
            files: files
        });
    }

    const directory = await fsPromises.readdir(dir);

    const flatten = !!flattenDepth && typeof flattenDepth === 'string' && isNumeric(flattenDepth);

    // @ts-ignore
    const files = flatten ? await mapDirectory(dir, directory, parseInt(flattenDepth)) : await mapDirectory(dir, directory);
    // console.log(files)

    return res.status(200).json({
        // directory: dir.replace('\\', '/'),
        breadcrumbs,
        files: files
    });
};

export const folders = async (req: Request, res: Response) => {
    // const files = await mapFolders()

    const files = await Promise.all(
        DIRECTORIES.map(async (dirObj: any) => {
            const pathToDir = `${dirObj.drive}:/${dirObj.folder}`;

            const obj = {
                name: dirObj.folder,
                id: await getIdByUrl(pathToDir),
                // type: isDirectory ? 'folder' : 'file',
                folders: await mapFolders(pathToDir)
            };

            return obj;
        })
    );

    return res.status(200).json(files);
};

export const file = async (req: Request, res: Response) => {
    // const fileId = req.query.d
    const fileId = req.params.id;


    // const acceptEncoding = req.headers['accept-encoding'];
    // console.log(acceptEncoding)

    // console.log(req.headers)

    const filePath = await getUrlById(fileId);
    // console.log(filePath)

    if (!filePath) {
        return res.sendStatus(404);
    }

    if (isAudioFile(filePath) || isVideoFile(filePath)) {

        try {
            const stat = await fsPromises.lstat(filePath);

            const fileSize = stat.size;

            const range = req.headers.range;
            // console.log(range)

            if (range) {
                const parts = range.replace(/bytes=/, '').split('-');

                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

                const chunksize = (end - start) + 1;

                const stream = fs.createReadStream(filePath, { start, end });

                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': 'video/mp4',
                };

                res.writeHead(206, head);

                return stream.pipe(res);

            } else {
                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': 'video/mp4',
                };

                res.writeHead(200, head);

                const stream = fs.createReadStream(filePath);

                return stream.pipe(res);
            }
        } catch (err) {
            console.log(err);
            if (err !== null && err.code === 'ENOENT') {
                return res.sendStatus(404);
            }
        }
    }

    const stream = fs.createReadStream(filePath);
    return stream.pipe(res);
};

export const download = async (req: Request, res: Response) => {
    const fileId = req.params.id;

    const filePath = await getUrlById(fileId);

    if (!filePath) {
        return res.sendStatus(404);
    }

    res.download(filePath);
};
