import type { TAppRouter } from '../types';
import jwt from 'jsonwebtoken';

export interface IUser {
    readonly username: string,
    readonly role: 'admin' | 'member',
    readonly iat: string,
}

export const authentication: TAppRouter = (context) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        const state = req.query.state;

        if (authHeader) {
            const token = authHeader.split(' ')[1];

            jwt.verify(token, context.env.SERVER_ACCESS_TOKEN_SECRET!, (err, user) => {
                if (err) {
                    return res.sendStatus(403);
                }

                req.user = user as unknown as IUser;
                next();
            });
        } else if(state) {
            const token = String(state);

            jwt.verify(token, context.env.SERVER_ACCESS_TOKEN_SECRET!, (err, user) => {
                if (err) {
                    return res.sendStatus(403);
                }

                req.user = user as unknown as IUser;
                next();
            });
        } else {
            res.sendStatus(401);
        }
    }
};