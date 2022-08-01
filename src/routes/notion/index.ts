import type { TAppRouter } from './../../types';
import { Router } from 'express'
import { Notion } from './../../services/notion';
import { notionSettingsRoute } from './settings';
import axios from 'axios';
import { loadNotionIntegration, loadUser } from './../../middleware';
import { Client } from '@notionhq/client';

export const notionRoute: TAppRouter = (context) => {
    const router = Router();
    return router
        .get('/auth', async (req, res) => {
            try {
                const code = req.query.code;
                let buff = new Buffer(`${context.env.NOTION_CLIENT_ID}:${context.env.NOTION_CLIENT_SECRET}`);
                const result = await axios.post(`https://api.notion.com/v1/oauth/token`,
                    {
                        grant_type: 'authorization_code',
                        code,
                        redirect_uri: context.env.AUTH_REDIRECT_URI
                    },
                    {
                        headers: {
                            Authorization: `Basic ${buff.toString('base64')}`,
                            'Content-Type': 'application/json'
                        }
                    })

                if (result.status === 200) {
                    console.log(result.data);
                    const notionIntegration = {
                        ...result.data,
                        date_created: new Date(),
                        planner_database_id: null,
                        planer_item_types: null,
                    }
                    const existongNotionIntegration = await context.db.notionIntegration.get(notionIntegration.bot_id);
                    if (!existongNotionIntegration) {
                        const insertIntegrationResults = await context.db.notionIntegration.insert(notionIntegration);
                        console.log('db insertIntegrationResults', insertIntegrationResults);
                        console.log('To Update: ', req.userId, notionIntegration.bot_id);
                        const updateUserResults = await context.db.users.saveNotionConnection(req.userId, notionIntegration.bot_id);
                        console.log('db updateUserResults', updateUserResults);

                    } else {
                        await context.db.notionIntegration.update(existongNotionIntegration.bot_id, {
                            planner_database_id: null,
                            planer_item_types: null
                        });
                    }
                    const notion = new Notion({ integration: notionIntegration, db: context.db });
                    const plannerDatabaseSetup = await notion.determinePlannerDatabese();
                    // res.json({
                    //     sucsess: true, data: {
                    //         plannerDatabaseSetup
                    //     }
                    // });
                    return res.redirect(context.env.FINAL_AUTH_URL);
                } else {
                    return res.status(400).json({ message: 'Auth Failed' })
                }
            } catch (err) {
                console.log('routeOAuth ERROR: ', err);
                res.status(500).json({ message: 'Auth Failed' });
            }
        })
        .use(loadUser(context), loadNotionIntegration(context))
        .get('/', (req, res) => {
            res.json({ res: req.notionIntegration });
        })
        .use('/settings', notionSettingsRoute(context))
        .get('/databases', async (req, res) => {
            const notion = new Notion({ integration: req.notionIntegration, db: context.db });
            const notionDatabases = await notion.listAllDatabases();
            res.json(notionDatabases)
        })
        .get('/database/:id', async (req, res) => {
            const id = req.params.id;
            if (!id) {
                res.sendStatus(404);
            }
            const notion = new Notion({ integration: req.notionIntegration, db: context.db });
            const notionDatabases = await notion.getDatabase(id);
            res.json(notionDatabases)
        })
        .post('/addItemToInbox', async (req, res) => {
            try {
                const { text, type } = req.body;
                const notion = new Notion({ integration: req.notionIntegration, db: context.db });
                const typeElement = req.notionIntegration.planer_item_types?.values.find(value => value.name === type);
                if (typeElement) {
                    const newItem = await notion.addToInbox(text, typeElement.id);
                    return res.json({ success: true, data: newItem });
                }
                console.log('notion/addItemToInbox ERROR: can not match the type');
                return res.json({ success: false, message: 'can not match the type' });
            } catch (err) {
                console.log('addItemToInbox ERROR: ', err);
                res.status(500).json({ message: 'addItemToInbox Failed' });
            }
        })
};