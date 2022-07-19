import type { TAppRouter } from '../types';
import { Router } from 'express'
import { Notion } from './../services/notion';

import axios from 'axios';

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
                        botId: result.data.bot_id,
                        accessToken: result.data.access_token,
                        workspaceId: result.data.workspace_id,
                        owner: result.data.owner,
                        workspaceName: result.data.workspace_name,
                        workspaceIcon: result.data.workspace_icon,
                        tokenType: result.data.token_type,
                        dateCreated: new Date(),
                    }
                    const { rows: insertIntegrationResults } = await context.db.insertNotionIntegration(notionIntegration);
                    console.log('db insertIntegrationResults', insertIntegrationResults);
                    console.log('To Update: ', req.userId, notionIntegration.botId);
                    const { rows: updateUserResults } = await context.db.updateUserNotionIntegration(req.userId, notionIntegration.botId);
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
        .post('/addItemToInbox', async (req, res) => {
            try {
                const { text } = req.body;
                const userId = req.userId
                const { rows: notionIntegration } = await context.db.getNotionIntegrationByUserId(String(userId));
                const token = notionIntegration[0].access_token;
                const notion = new Notion(token, context.db);
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
        .post('/setPlannerDatabase/:databaseId', async (req, res) => {
            try {
                const userId = req.userId
                const databaseId = req.params.databaseId;
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
};