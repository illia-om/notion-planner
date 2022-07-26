import type { TAppRouter } from '../types';

export const loadNotionIntegration: TAppRouter = (context) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                const userId = req.userId;
                const user = await context.db.users.get(userId);
                if (!user) {
                    return res.status(400).json({message:`can't find user`});
                }
                req.user = user;
            }
            if (req.user.notion_integration_id) {
                const notoinIntegratoinDetails = await context.db.notionIntegration.get(req.user.notion_integration_id);
                console.log('loadNotionIntegration: ', notoinIntegratoinDetails);
                req.notionIntegration = notoinIntegratoinDetails!;
                next();
            } else {
                return res.status(400).json({message:`can't find notion integration`});
            }
        } catch (err) {
            console.log('loadNotionIntegration ERROR: ', err);
            res.status(500).json({ message: 'loadNotionIntegration Failed' });
        }
    }
};