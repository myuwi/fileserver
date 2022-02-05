import { Request, Response, NextFunction } from 'express';

export const logRequest = (req: Request, res: Response, next: NextFunction) => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().substr(11, 8);

    // const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(':').pop()

    console.log(`[${localISOTime}] ${req.method} ${req.originalUrl} ${req.ip.split(':').pop()}`);
    // console.log(`[${Date.now()}] ${req.method} ${req.originalUrl} ${req.ip}`)
    if (JSON.stringify(req.body) !== '{}') console.log(req.body);
    next();
};