import type { TAppRouter } from './../../types';
import { Router } from 'express'
import { Notion } from './../../services/notion';
import { notionSettingsRoute } from './settings';
import axios from 'axios';
import { loadNotionIntegration, loadUser } from './../../middleware';

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
                    const insertIntegrationResults = await context.db.notionIntegration.insert(notionIntegration);
                    console.log('db insertIntegrationResults', insertIntegrationResults);
                    console.log('To Update: ', req.userId, notionIntegration.botId);
                    const updateUserResults = await context.db.users.saveNotionConnection(req.user.username, notionIntegration.bot_id);
                    console.log('db updateUserResults', updateUserResults);
                } else {
                    return res.status(400).json({ message: 'Auth Failed' })
                }
                return res.redirect(context.env.FINAL_AUTH_URL);
                // res.json({ sucsess: true, data: 'Auth Successful' });
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
        .post('/addItemToInbox', async (req, res) => {
            try {
                const { text } = req.body;
                const notion = new Notion({ integration: req.notionIntegration, db: context.db });
                const newItem = await notion.addItemToDatabase(process.env.PLANNER_ID!, {
                    "title": {
                        "title": [
                            {
                                "text": {
                                    "content": text!
                                }
                            }
                        ]
                    }
                });
                res.json({ success: true, data: newItem });
            } catch (err) {
                console.log('addItemToInbox ERROR: ', err);
                res.status(500).json({ message: 'addItemToInbox Failed' });
            }
        })
};