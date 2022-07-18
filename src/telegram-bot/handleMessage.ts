import { TTelegramRouter } from './../types';
import { Client } from '@notionhq/client';

export const hendleMessage: TTelegramRouter = async (context, { msg }) => {
    try {
        console.log('hendleMessage: ', msg);
        if (msg.entities && msg.entities[0].type === 'bot_command') {
            return;
        }
        const { rows: notionIntegration } = await context.db.getNotionIntegrationByTelegramUserId(String(msg.chat.id));
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
                        "content": msg.text!
                      }
                    }
                  ]
                }
              }
            })
        context.telegramBot.sendMessage(msg.chat.id, 'Added new item to the inbox:\n' + sg.text!);
    } catch (err) {
        console.log('hendleMessage ERROR: ', err);
    }
}