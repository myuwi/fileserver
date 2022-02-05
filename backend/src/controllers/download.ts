import { Request, Response } from 'express';

import { getUrlById } from '../functions';

export const download = async (req: Request, res: Response) => {
    const fileId = req.params.id;

    const filePath = await getUrlById(fileId);

    if (!filePath) {
        return res.sendStatus(404);
    }

    res.download(filePath);
};
