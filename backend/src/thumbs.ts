import { promises as fsPromises } from 'graceful-fs';
import * as ffmpeg from 'fluent-ffmpeg';
import * as sharp from 'sharp';
import * as path from 'path';
import { __rootdir__ } from './root';

import { Dimensions } from './types';

/**
 * Thumbnail image max size on an axissize.
 */
export const THUMB_SIZE = 160;

/**
 * The directory where image and video thumbnails are stored.
 */
export const THUMB_DIR = path.join(__rootdir__, '..', 'thumbs');



const getDimentions = (filePath: string): Promise<Dimensions> => {
    // console.log('Getting Dimentions from:', filePath)
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                // console.log('Error occured while getting dimensions of:', filePath)
                return reject(err);
            }

            let size;

            for (let i = 0; i < metadata.streams.length; i++) {
                if (metadata.streams[i].codec_type === 'video') {
                    size = {
                        width: metadata.streams[i].width,
                        height: metadata.streams[i].height
                    };
                    break;
                }
            }

            if (!size) return reject('Couldn\'t find video dimensions');
            // console.log(metadata)

            return resolve(size);
        });
    });
};



export const getFileThumbnail = async (id: string) => {
    if (!id) return false;
    const thumbName = `${id}.png`;
    const thumbNameNoExt = `${id}`;

    try {
        await fsPromises.access(path.join(THUMB_DIR, thumbName));
        // await fsPromises.access(path.join(thumbsFolder, thumbNameNoExt));
        return true;
    } catch (err) {
        return false;
    }
};



export const generateVideoThumbnail = async (filePath: string, fileId: string) => {
    if (!filePath || !fileId) return false;

    const thumbName = `${fileId}.png`;
    const thumbNameNoExt = `${fileId}`;

    try {
        const { width, height } = await getDimentions(filePath);

        if (!width || !height) throw new Error();
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

        // await fsPromises.rename(path.join(thumbsFolder, thumbName), path.join(thumbsFolder, thumbNameNoExt));

        console.log(`Thumbnail generated: ${thumbName}`);
        return true;
    } catch (err) {
        // console.log(err)
        // console.log('failed to generate thumbnail for ' + filePath)
        return false;
    }
};



export const generateImageThumbnail = async (filePath: string, fileId: string) => {
    if (!filePath || !fileId) return false;

    const thumbName = `${fileId}.png`;
    const thumbNameNoExt = `${fileId}`;

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
        // console.log('failed to generate thumbnail for ' + filePath)
        return false;
    }
};