import { TTelegramMessageRouter } from './../types';
import { Client } from '@notionhq/client';

export const hendleMessage: TTelegramMessageRouter = async (context, { msg }) => {
  try {
    if (msg.entities && msg.entities[0].type === 'bot_command') {
      return;
    }
    const replyMarkupKeyboard = [
      [
        {
          text: '📍 task',
          callback_data: `task:${msg.text}`
        },
        {
          text: '💡 idea',
          callback_data: `idea:${msg.text}`
        }
      ], [
        {
          text: '📚 book',
          callback_data: `book:${msg.text}`
        },
        {
          text: '🎦 movie',
          callback_data: `movie:${msg.text}`
        }
      ],
    ]
    if (!msg.text) {
      context.telegramBot.sendMessage(msg.chat.id, `Don't get what you mean...\nplease use text message to add items to the inbox`);
      return;
    }
    const replyMessage = await context.telegramBot.sendMessage(msg.chat.id, `Adding new item\n*"${msg.text}"*\nChoose a type:`, {
      parse_mode: 'Markdown'
    });
    await context.telegramBot.editMessageReplyMarkup({
      inline_keyboard: replyMarkupKeyboard
    }, {
      chat_id: replyMessage.chat.id,
      message_id: replyMessage.message_id
    });
    // await context.telegramBot.sendMessage(msg.chat.id, 'HI');
    // const { rows: notionIntegration } = await context.db.getNotionIntegrationByTelegramUserId(String(msg.chat.id));
    // const token = notionIntegration[0].access_token;
    // const notion = new Client({
    //     auth: token
    // });
    // const res = await notion.pages.create({
    //       "parent": {
    //         "type": "database_id",
    //         "database_id": process.env.PLANNER_ID!
    //       },
    //       "properties": {
    //         "title": {
    //           "title": [
    //             {
    //               "text": {
    //                 "content": msg.text!
    //               }
    //             }
    //           ]
    //         }
    //       }
    //     })
  } catch (err) {
    console.log('hendleMessage ERROR: ', err);
  }
}