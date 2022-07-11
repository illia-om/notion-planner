import express, { Express, Request, Response } from 'express';
import { json } from 'body-parser';
import dotenv from 'dotenv';

import TelegramBot from 'node-telegram-bot-api';
import { Client } from '@notionhq/client';
import { env } from 'process';
import {
  IRouteContext,
  routeTest,
  routeLogin,
  middlewareAuth,
  routeTelegramBot
} from './src/routes'

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN!;
const port = process.env.PORT;

const routeContext: IRouteContext = {
  telegramBot: new TelegramBot(token, { polling: true }),
  notion: new Client({
    auth: process.env.NOTION_ACCESS_TOKEN,
  })
}
const app: Express = express();
const bot = new TelegramBot(token, { polling: true });
const notion = new Client({
  auth: process.env.NOTION_ACCESS_TOKEN,
})

app
  .use(json())
  .get('/', (req: Request, res: Response) => {
    res.send(`Notion Planner App`);
  })
  .post('/login', routeLogin(routeContext))
  .use(middlewareAuth(routeContext))
  .get('/test', routeTest(routeContext))
  .use('/api/bot/', routeTelegramBot(routeContext))
  .listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });


bot.onText(/\/add (.+)/, async (msg, match) => {

  const chatId = msg.chat.id;
  const resp = match![1]; // the captured "whatever"
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
              "content": resp
            }
          }
        ]
      }
    }
  })
  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, `Added new task with name: ${resp}`);
});