import type { TAppRouter } from '../types';
import { Router } from 'express';
import { Notion } from './../services/notion';

export const routeTest: TAppRouter = (context) => {
    const router = Router();
    return router
        .get('/', async (req, res) => {
            try {
                const notionClient = new Notion({ integration: req.notionIntegration, db: context.db });
                const dbs = await notionClient.getPlannerItemTypes();
                res.json({ dbs });
            } catch (err) {
                console.log('routeTest ERROR: ', err);
            }
        })
};