import type { TAppRouter } from './types';

export const routeUser: TAppRouter = (context) => {
    return (req, res) => {
        res.json({
            success: true,
            user: req.user
        });
    }
};