import type { TAppRouter } from './types';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

export interface IUser {
    readonly username: string,
    readonly role: 'admin' | 'member',
    readonly iat: string,
}

export const middlewareAuth: TAppRouter = (context) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const token = authHeader.split(' ')[1];

            jwt.verify(token, process.env.SERVER_ACCESS_TOKEN_SECRET!, (err, user) => {
                if (err) {
                    return res.sendStatus(403);
                }

                // req.user = JSON.parse(user as string) as IUser;
                req.user = user as unknown as IUser;
                next();
            });
        } else {
            res.sendStatus(401);
        }
    }
};