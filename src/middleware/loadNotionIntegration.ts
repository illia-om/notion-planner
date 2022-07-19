import type { TAppRouter, INotionIntegration } from '../types';
import jwt from 'jsonwebtoken';

export const loadNotionIntegration: TAppRouter = (context) => {
    return async (req, res, next) => {
        try {
            const userId = req.userId;
            const { rows: notoinIntegratoinDetails } = await context.db.getNotionIntegrationByUserId(userId);
            console.log('loadNotionIntegration: ', notoinIntegratoinDetails);
            req.notionIntegration = notoinIntegratoinDetails as unknown as INotionIntegration;
            next();
        } catch (err) {
            console.log('loadNotionIntegration ERROR: ', err);
            res.status(500).json({ message: 'loadNotionIntegration Failed' });
        }
    }
};