import type { TAppRouter } from '../types';
import jwt from 'jsonwebtoken';

export interface IUser {
    readonly username: string,
    readonly role: string,
    readonly notionIntegrationId: string | null,
    readonly iat: number
}

export const authentication: TAppRouter = (context) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            const state = req.query.state;
            let token = '';
            
            if (authHeader) {
                token = authHeader.split(' ')[1];
            } else if (state) {
                token = String(state);
            } else {
                return res.sendStatus(401);
            }
            
            jwt.verify(token, context.env.SERVER_ACCESS_TOKEN_SECRET!, async (err, data) => {
                if (err) {
                    return res.sendStatus(403);
                }
                const userData = jwt.decode(token) as jwt.JwtPayload;
                const userId = userData.username;
                req.userId = userId;
                next();
            });
        } catch (err) {
            console.log('authentication ERROR: ', err);
            res.status(500).json({ message: 'authentication Failed' });
        }
    }
};