import type { TAppRouter } from '../types';
import jwt from 'jsonwebtoken';

export interface IUser {
    readonly username: string,
    readonly role: string,
    readonly notionIntegrationId: string | null,
    readonly iat: number
}

export const authentication: TAppRouter = (context) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        const state = req.query.state;

        if (authHeader) {
            const token = authHeader.split(' ')[1];
            jwt.verify(token, context.env.SERVER_ACCESS_TOKEN_SECRET!, async (err, data) => {
                if (err) {
                    return res.sendStatus(403);
                }
                const userData = jwt.decode(token) as jwt.JwtPayload;
                const userRole = await context.db.getRoleName(userData.roleId)
                const user = {
                    username: userData.username,
                    role: userRole as string,
                    notionIntegrationId: userData.notionIntegrationId,
                    iat: userData.iat as number
                }
                req.user = user;
                next();
            });
        } else if (state) {
            const token = String(state);

            jwt.verify(token, context.env.SERVER_ACCESS_TOKEN_SECRET!, async (err, data) => {
                if (err) {
                    return res.sendStatus(403);
                }
                const userData = jwt.decode(token) as jwt.JwtPayload;
                const userRole = await context.db.getRoleName(userData.roleId)
                const user = {
                    username: userData.username,
                    role: userRole as string,
                    notionIntegrationId: userData.notionIntegrationId,
                    iat: userData.iat as number
                }
                req.user = user;
                next();
            });
        } else {
            res.sendStatus(401);
        }
    }
};