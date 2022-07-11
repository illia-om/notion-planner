import type { TAppRouter } from './types';

export const routeTest: TAppRouter = (context) => {
    return async (req, res) => {
        const result = await context.notion.pages.properties.retrieve({
            page_id: '059d501b-9a3a-431d-b46a-c2085c9780de',
            property_id: 'title'
          })
          res.json({ result });
    }
};