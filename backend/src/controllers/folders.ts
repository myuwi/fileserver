import { Request, Response } from 'express';

import { getIdByUrl, mapFolders } from '../functions';

export const folders = async (req: Request, res: Response) => {
    // const files = await Promise.all(
    //     DIRECTORIES.map(async (dirObj: any) => {
    //         const pathToDir = `${dirObj.base}${dirObj.folder}`;

    //         const obj = {
    //             name: dirObj.folder,
    //             id: await getIdByUrl(pathToDir),
    //             // type: isDirectory ? 'folder' : 'file',
    //             folders: await mapFolders(pathToDir),
    //         };

    //         return obj;
    //     })
    // );

    const files: any[] = [];
    return res.status(200).json(files);
};
