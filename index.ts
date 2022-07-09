import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import { Client } from '@notionhq/client';
import { env } from 'process';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN!;
const port = process.env.PORT;


const app: Express = express();
const bot = new TelegramBot(token, { polling: true });
const notion = new Client({
  auth: process.env.NOTION_ACCESS_TOKEN,
})

app.get('/', (req: Request, res: Response) => {
  res.send(`Express + TypeScript Server ${process.env.TEST_DATA}`);
});

app.get('/tasks', async (req: Request, res: Response) => {
  const result = await notion.pages.properties.retrieve({
    page_id: '059d501b-9a3a-431d-b46a-c2085c9780de',
    property_id: 'title'
  })
  res.json({ result });
});

app.get('/', (req: Request, res: Response) => {
  res.send(`Express + TypeScript Server ${process.env.TEST_DATA}`);
});

app.get('/stopBot', (req: Request, res: Response) => {
  bot.stopPolling();
  res.send(`Bot Stopped`);
});

app.get('/startBot', (req: Request, res: Response) => {
  bot.startPolling({ restart: true });
  res.send(`Bot Started`);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});


// Matches "/add [whatever]"
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

// Listen for any kind of message. There are different kinds of
// messages.
// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;

//   // send a message to the chat acknowledging receipt of their message
//   bot.sendMessage(chatId, 'Received your message =) !');
// });