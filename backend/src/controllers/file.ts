import * as fs from 'graceful-fs';
const fsPromises = fs.promises;

import { Request, Response } from 'express';

import { getUrlById, isAudioFile, isImageFile, isVideoFile } from '../functions';

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

                const contentLength = end - start + 1;

                const stream = fs.createReadStream(filePath, { start, end });

                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': contentLength,
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
        } catch (err: any) {
            console.log(err);
            if (err !== null && err.code === 'ENOENT') {
                return res.sendStatus(404);
            }
        }
    }

    const stream = fs.createReadStream(filePath);
    return stream.pipe(res);
};
