import type { TAppRouter } from '../types';
import { Router } from 'express';

export const routeTest: TAppRouter = (context) => {
    const router = Router();
    return router
        .get('/', async (req, res) => {
            try {
                const dbClient = await context.pool.connect();
                const result = await dbClient.query('SELECT * FROM test_table');
                // const result = await context.notion.pages.properties.retrieve({
                //     page_id: '059d501b-9a3a-431d-b46a-c2085c9780de',
                //     property_id: 'title'
                // })
                res.json({ result });
            } catch (err) {
                console.log('routeTest ERROR: ', err);
            }
        })
};