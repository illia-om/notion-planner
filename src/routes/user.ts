import type { TAppRouter } from '../types';
import { Router } from 'express';

export const routeUser: TAppRouter = (context) => {
    const router = Router();
    return router
        .get('/', (req, res) => {
            res.json({
                success: true,
                user: req.user
            });
        })
};