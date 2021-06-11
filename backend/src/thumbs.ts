import { promises as fsPromises } from 'graceful-fs';
import * as ffmpeg from 'fluent-ffmpeg';
import * as sharp from 'sharp';
import * as path from 'path';
import { __rootdir__ } from './root';

import { Dimensions } from './types';

/**
 * Thumbnail image max size on an axis.
 */
export const THUMB_SIZE = 128;

export const THUMB_EXTENSION = '.jpg';

/**
 * The directory where image and video thumbnails are stored.
 */
export const THUMB_DIR = path.join(__rootdir__, '..', 'thumbs');


/**
 * Returns the dimensions of a video file.
 */
const getDimentions = (filePath: string) => {
    // console.log('Getting Dimentions from:', filePath)
    return new Promise<Dimensions>((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                // console.log('Error occured while getting dimensions of:', filePath)
                return reject(err);
            }

            const stream = metadata.streams.find((stream) =>
                stream.codec_type === 'video' && typeof stream.width === 'number' && typeof stream.height === 'number'
            );

            if (!stream || !stream.height || !stream.width) return reject('Couldn\'t find video dimensions');

            return resolve({
                height: stream.height,
                width: stream.width
            });
        });
    });
};



export const getFileThumbnail = async (id: string) => {
    if (!id) return false;
    const thumbName = `${id}${THUMB_EXTENSION}`;

    try {
        await fsPromises.access(path.join(THUMB_DIR, thumbName));
        return true;
    } catch (err) {
        return false;
    }
};



export const generateVideoThumbnail = async (filePath: string, fileId: string) => {
    if (!filePath || !fileId) return false;

    const thumbName = `${fileId}${THUMB_EXTENSION}`;

    try {
        const { width, height } = await getDimentions(filePath);

        console.log(`Generating thumbnail: ${thumbName}`);

        const size = width > height ? `${THUMB_SIZE}x?` : `?x${THUMB_SIZE}`;

        await new Promise((resolve, reject) => {
            ffmpeg(filePath)
                .on('error', (err) => {
                    reject(err);
                })
                .on('end', () => {
                    resolve(1);
                })
                .screenshots({
                    timestamps: ['10%'],
                    filename: thumbName,
                    folder: THUMB_DIR,
                    size: size // '?x200'
                });
        });


        console.log(`Thumbnail generated: ${thumbName}`);
        return true;
    } catch (err) {
        console.log(err);
        console.log('failed to generate thumbnail for ' + filePath);
        return false;
    }
};



export const generateImageThumbnail = async (filePath: string, fileId: string) => {
    if (!filePath || !fileId) return false;

    const thumbName = `${fileId}${THUMB_EXTENSION}`;

    try {
        console.log(`Generating thumbnail: ${thumbName}`);

        await sharp(filePath)
            .resize(THUMB_SIZE, THUMB_SIZE, {
                kernel: sharp.kernel.nearest,
                // fit: 'cover',
                fit: 'outside',
            })
            .toFile(path.join(THUMB_DIR, thumbName));


        return true;
    } catch (err) {
        // console.log(err)
        console.log('failed to generate thumbnail for ' + filePath);
        return false;
    }
};