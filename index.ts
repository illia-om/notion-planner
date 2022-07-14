import express, { Express, Request, Response } from 'express';
import { json } from 'body-parser';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import { Client } from '@notionhq/client';
import { Pool } from 'pg';
import {
  routeTest,
  loginRoute,
  telegramRoute,
  routeUser,
  notionRoute
} from './src/routes';
import {
  IRouteContext
} from './src/types';
import { authentication } from './src/middleware';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN!;
const port = process.env.PORT;

const routeContext: IRouteContext = {
  env: process.env as Record<string, string>,
  telegramBot: new TelegramBot(token, { polling: true }),
  notion: new Client({
    auth: process.env.NOTION_ACCESS_TOKEN,
  }),
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
}

const app: Express = express();

app
  .use(json())

  .get('/', (req: Request, res: Response) => {
    res.send(`Notion Planner App`);
  })

  .post('/login', loginRoute(routeContext))
  
  .use(authentication(routeContext))
  .use('/notion', notionRoute(routeContext))
  .use('/telegramBot/', telegramRoute(routeContext))
  .use('/test', routeTest(routeContext))
  .use('/user', routeUser(routeContext))
  .listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });


// bot.onText(/\/add (.+)/, async (msg, match) => {

//   const chatId = msg.chat.id;
//   const resp = match![1]; // the captured "whatever"
//   const res = await notion.pages.create({
//     "parent": {
//       "type": "database_id",
//       "database_id": process.env.PLANNER_ID!
//     },
//     "properties": {
//       "title": {
//         "title": [
//           {
//             "text": {
//               "content": resp
//             }
//           }
//         ]
//       }
//     }
//   })
//   // send back the matched "whatever" to the chat
//   bot.sendMessage(chatId, `Added new task with name: ${resp}`);
// });