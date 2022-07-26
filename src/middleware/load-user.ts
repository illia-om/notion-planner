import type { TAppRouter } from '../types';

export const loadUser: TAppRouter = (context) => {
    return async (req, res, next) => {
        try {
            const userId = req.userId;
            const user = await context.db.users.get(userId);
            if (!user) {
                return res.status(400).json({message:`can't find user`});
            }
            req.user = user;
            next();
        } catch (err) {
            console.log('loadNotionIntegration ERROR: ', err);
            res.status(500).json({ message: 'loadNotionIntegration Failed' });
        }
    }
};