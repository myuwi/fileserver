import { Request, Response } from 'express';

import { resolvePath, fileInfo, DIRECTORIES, getDirFiles } from '../functions';

export const directory = async (req: Request, res: Response) => {
    // const reqDir = req.query.dir;
    const reqDir = req.params.id;

    let pathInfo;
    try {
        pathInfo = await resolvePath(typeof reqDir === 'string' ? reqDir : undefined);
    } catch (err) {
        return res.status(404).json({
            message: 'Invalid path',
        });
    }

    const { dir, breadcrumbs } = pathInfo;

    if (dir === 'ROOT') {
        const files = await Promise.all(
            DIRECTORIES.map(async (dirObj: any) => {
                const pathToDir = `${dirObj.base}${dirObj.folder}`;
                return await fileInfo(pathToDir);
            })
        );

        return res.status(200).json({
            breadcrumbs,
            files: files,
        });
    }

    const files = await getDirFiles(dir);

    return res.status(200).json({
        // directory: dir.replace('\\', '/'),
        breadcrumbs,
        files: files,
    });
};
