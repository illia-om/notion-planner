import type { TAppRouter } from '../types';
import { Router } from 'express'
import { Client } from '@notionhq/client';
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
                const notion = new Client({
                    auth: token
                });
                const res = await notion.pages.create({
                    "parent": {
                        "type": "database_id",
                        "database_id": process.env.PLANNER_ID!
                    },
                    "properties": {
                        "title": {
                            "title": [
                                {
                                    "text": {
                                        "content": text!
                                    }
                                }
                            ]
                        }
                    }
                })
            } catch(err) {
                console.log('addItemToInbox ERROR: ', err);
                res.status(500).json({ message: 'addItemToInbox Failed' });
            }
        })
};