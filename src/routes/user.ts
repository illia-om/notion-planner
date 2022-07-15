import type { TAppRouter } from '../types';
import { Router } from 'express';

export const routeUser: TAppRouter = (context) => {
    const router = Router();
    return router
        .get('/current', async (req, res) => {
            try {
                const { rows: userData } = await context.db.getUserByUsername(req.userId);
                if (userData.length === 1) {
                    const userRole = await context.db.getRoleName(userData[0].role_id);
                    console.log(userData);
                    const user = {
                        username: req.userId,
                        role: userRole as string,
                        notionIntegrationId: userData[0].notion_integration_id
                    }
                    res.json({
                        success: true,
                        user: user
                    });
                } else {
                    res.sendStatus(404);
                }
            } catch (err) {
                console.log('routeUser/current ERROR: ', err);
                return res.sendStatus(500);
            }
        })
        .post('/register', (req, res) => {

        })
};