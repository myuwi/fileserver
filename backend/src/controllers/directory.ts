import { Request, Response } from 'express';
import path = require('path');

import { getDirFiles, getBreadcrumbs, getRootDirectoryContents } from '../functions';

export const directory = async (req: Request, res: Response) => {
    // const reqDir = req.query.dir;
    const id = req.params.id;

    let breadcrumbs;
    try {
        breadcrumbs = await getBreadcrumbs(id);
        // pathInfo = await resolvePath(typeof id === 'string' ? id : undefined);
    } catch (err) {
        return res.status(404).json({
            message: 'Invalid path',
        });
    }

    if (!breadcrumbs.length) {
        const files = await getRootDirectoryContents();

        return res.status(200).json({
            breadcrumbs: [],
            files: files,
        });
    }

    const files = await getDirFiles(breadcrumbs[breadcrumbs.length - 1].url);

    const breadcrumbsSafe = breadcrumbs.map((e) => ({
        id: e.id,
        name: path.basename(e.url),
    }));

    return res.status(200).json({
        breadcrumbs: breadcrumbsSafe,
        files: files,
    });
};
