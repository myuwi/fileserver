import { Request, Response } from 'express';
import path = require('path');

import { getDirFiles, getBreadcrumbs, getRootDirectoryContents } from '../functions';

export const directory = async (req: Request, res: Response) => {
    try {
        // const reqDir = req.query.dir;
        const id = req.params.id;

        let breadcrumbs;
        try {
            breadcrumbs = await getBreadcrumbs(id);
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

        const files = await getDirFiles(breadcrumbs[breadcrumbs.length - 1].id);
        console.log('a');

        const breadcrumbsSafe = breadcrumbs.map((e) => ({
            id: e.id,
            name: path.basename(e.path),
        }));

        return res.status(200).json({
            breadcrumbs: breadcrumbsSafe,
            files: files,
        });
    } catch (err) {
        console.log(err);
        res.status(500);
    }
};
