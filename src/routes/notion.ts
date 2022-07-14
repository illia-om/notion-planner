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

                console.log(result.data);
                // const dbClient = await context.pool.connect();
                // const r = await dbClient.query('SELECT * FROM test_table');
                res.json({ sucsess: true, data: 'Auth Successful' });
            } catch (err) {
                console.log('routeOAuth ERROR: ', err);
            }
        })
};