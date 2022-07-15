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
                    return res.json({
                        success: true,
                        user: user
                    });
                } else {
                    return res.status(404).json({ message: 'user not found' });
                }
            } catch (err) {
                console.log('routeUser/current ERROR: ', err);
                return res.sendStatus(500);
            }
        })
        .get('/notionIntegratoin', async (req, res) => {
            try {
                const { rows: userData } = await context.db.getUserByUsername(req.userId);
                if (userData.length === 1) {
                    const userNotionIntegrationId = userData[0].notion_integration_id;
                    if (!userNotionIntegrationId) {
                        return res.status(404).json({ message: 'notion integration not found' });
                    }
                    const { rows: userNotionIntegration } = await context.db.getNotionIntegrationById(userNotionIntegrationId);
                    console.log(userNotionIntegration[0]);
                    return res.json({
                        success: true,
                        notionIntegration: userNotionIntegration[0]
                    });
                } else {
                    return res.status(404).json({ message: 'user not found' });
                }
            } catch (err) {
                console.log('routeUser/current ERROR: ', err);
                return res.sendStatus(500);
            }
        })
        .get('/:username', async (req, res) => {
            //TODO: add permission check
            try {
                const userId = req.params.username;
                if (!userId) {
                    return res.sendStatus(404);
                }
                const { rows: userData } = await context.db.getUserByUsername(userId);
                if (userData.length === 1) {
                    const userRole = await context.db.getRoleName(userData[0].role_id);
                    console.log(userData);
                    const user = {
                        username: userId,
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
        .post('/register', async (req, res) => {
            try {
                const { userId } = req;
                console.log(userId);
                if (typeof userId == 'string' && userId !== '') {
                    const { rows: users } = await context.db.getUserByUsername(userId);
                    if (users.length > 0) {
                        return res.status(400).json({ message: 'User already registered' });
                    }
                    const { rows } = await context.db.registerUser(userId);
                    return res.json({
                        success: true,
                        user: rows[0]
                    });
                } else {
                    return res.sendStatus(401);
                }
            } catch (err) {
                console.log('routeUser/register ERROR: ', err);
                return res.sendStatus(500);
            }
        })
};