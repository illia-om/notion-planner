import type { TAppRouter } from '../types';
import { Router } from 'express'
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
                    const { rows: insertIntegrationResults} = await context.db.insertNotionIntegration(notionIntegration);
                    console.log('db insertIntegrationResults', insertIntegrationResults);
                    const { rows: updateUserResults} = await context.db.updateUserNotionIntegration(req.userId, notionIntegration.botId);
                    console.log('db updateUserResults', updateUserResults);
                }
                res.json({ sucsess: true, data: 'Auth Successful' });
            } catch (err) {
                console.log('routeOAuth ERROR: ', err);
            }
        })
};