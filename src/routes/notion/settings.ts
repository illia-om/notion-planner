import type { TAppRouter, INotionPlannerItemTypesProperty } from './../../types';
import { Router } from 'express'
import { Notion } from './../../services/notion';

export const notionSettingsRoute: TAppRouter = (context) => {
    const router = Router();
    return router
        .post('/plannerDatabase', async (req, res) => {
            try {
                const userId = req.userId
                const { databaseId } = req.body;
                if (!databaseId) {
                    res.status(401).json({message: `Don't forget to provide databaseId`});
                }
                const { rows: notionIntegration } = await context.db.getNotionIntegrationByUserId(String(userId));
                const token = notionIntegration[0].access_token;
                const notion = new Notion(token, context.db);
                const { rows: result } = await notion.updatePlannerDatabaseId(userId, databaseId);
                res.json({result});
            } catch (err) {
                console.log('setPlannerDatabase ERROR: ', err);
                res.status(500).json({ message: 'setPlannerDatabase Failed' });
            }
        })
        .post('/plannerItemTypes', async (req, res) => {
            try {
                const userId = req.userId
                const plannerItemTypesProperty = req.body.plannerItemTypesProperty as INotionPlannerItemTypesProperty;
                if (!plannerItemTypesProperty) {
                    res.status(401).json({message: `Don't forget to provide plannerItemTypesProperty`});
                }
                const { rows: notionIntegration } = await context.db.getNotionIntegrationByUserId(String(userId));
                const token = notionIntegration[0].access_token;
                const notion = new Notion(token, context.db);
                const { rows: result } = await notion.updatePlannerItemTypes(userId, plannerItemTypesProperty);
                res.json({result});
            } catch (err) {
                console.log('setPlannerDatabase ERROR: ', err);
                res.status(500).json({ message: 'setPlannerDatabase Failed' });
            }
        })
};