import type { TAppRouter } from '../types';
import { Router } from 'express';
import { loadUser, loadNotionIntegration } from '../middleware';
import { Notion } from '../services/notion';

export const routeUser: TAppRouter = (context) => {
    const router = Router();
    return router
        .post('/register', async (req, res) => {
            try {
                const { userId } = req;
                console.log(userId);
                if (typeof userId == 'string' && userId !== '') {
                    const user = await context.db.users.get(userId);
                    if (user) {
                        return res.status(400).json({ message: 'User already registered' });
                    }
                    const createdUser = await context.db.users.createUser(userId);
                    if (!createdUser) {
                        return res.status(401).json({ message: 'regiser failed' });
                    }
                    return res.json({
                        success: true,
                        user: createdUser
                    });
                } else {
                    return res.sendStatus(401);
                }
            } catch (err) {
                console.log('routeUser/register ERROR: ', err);
                return res.sendStatus(500);
            }
        })
        .use(loadUser(context))
        .get('/current', async (req, res) => {
            return res.json({
                success: true,
                user: req.user
            });
        })
        .get('/notionIntegratoin', loadNotionIntegration(context), async (req, res) => {
            const notion = new Notion({ integration: req.notionIntegration, db: context.db });
            if(!req.notionIntegration.planner_database_id) {
                return res.json({
                    success: true,
                    notionIntegration: {
                        workspace_name: req.notionIntegration.workspace_name,
                        workspace_icon: req.notionIntegration.workspace_icon,
                        planner: undefined
                    }
                });
            }
            const plannerDb = await notion.getDatabase(req.notionIntegration.planner_database_id!) as any;
            const plannerTitle = plannerDb.title[0].plain_text;
            return res.json({
                success: true,
                notionIntegration: {
                    workspace_name: req.notionIntegration.workspace_name,
                    workspace_icon: req.notionIntegration.workspace_icon,
                    planner: {
                        databaseName: plannerTitle,
                        types: req.notionIntegration.planer_item_types?.values.map(value => value.name) 
                    }
                }
            });
        })
        .get('/:username', async (req, res) => {
            //TODO: add permission check
            try {
                const userId = req.params.username;
                if (!userId) {
                    return res.sendStatus(404);
                }
                const user = await context.db.users.get(userId);
                if (user) {
                    const userRole = await context.db.roles.getName(user.role_id);
                    const userData = {
                        username: userId,
                        role: userRole as string,
                        notionIntegrationId: user.notion_integration_id
                    }
                    res.json({
                        success: true,
                        user: userData
                    });
                } else {
                    res.sendStatus(404);
                }
            } catch (err) {
                console.log('routeUser/current ERROR: ', err);
                return res.sendStatus(500);
            }
        })
};