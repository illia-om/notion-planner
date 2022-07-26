import type { TAppRouter } from './../../types';
import { Router } from 'express'
import { Notion } from './../../services/notion';
import { INotionPlannerItemTypesProperty } from '../../db/NotionIntegrationTable';

export const notionSettingsRoute: TAppRouter = (context) => {
    const router = Router();
    return router
        .post('/plannerDatabase', async (req, res) => {
            try {
                const { databaseId } = req.body;
                if (!databaseId) {
                    res.status(401).json({ message: `Don't forget to provide databaseId` });
                }
                const updatedNotionIntegration = await context.db.notionIntegration.update(
                    req.notionIntegration.bot_id,
                    { planner_database_id: databaseId }
                );
                res.json({ updatedNotionIntegration });
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
                    res.status(401).json({ message: `Don't forget to provide plannerItemTypesProperty` });
                }
                // const notion = new Notion({ integration: req.notionIntegration, db: context.db });
                const updatedNotionIntegration = await context.db.notionIntegration.update(
                    req.notionIntegration.bot_id,
                    { planer_item_types: plannerItemTypesProperty }
                );
                res.json({ updatedNotionIntegration });
            } catch (err) {
                console.log('setPlannerDatabase ERROR: ', err);
                res.status(500).json({ message: 'setPlannerDatabase Failed' });
            }
        })
};