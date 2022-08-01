import { TTelegramMessageRouter } from './../types';
import { Client } from '@notionhq/client';

export const hendleMessage: TTelegramMessageRouter = async (telegram, { msg }) => {
  try {
    if (msg.entities && msg.entities[0].type === 'bot_command') {
      return;
    }
    const isNotionLoaded = await telegram.withNotion(msg);
    if (!isNotionLoaded) {
      return;
    }

    const itemTypes = await telegram.notion!.getPlannerItemTypes();
    if (!itemTypes) {
      telegram.bot.sendMessage(msg.chat.id, telegram.language.say('noNotionItemTypes'));
      return;
    }
    const buttons = itemTypes.values.map(value => ({
      text: value.name,
      callback_data: `type=${value.id}text=${msg.text}`
    }));
    if (!msg.text) {
      telegram.bot.sendMessage(msg.chat.id, `Don't get what you mean...\nplease use text message to add items to the inbox`);
      return;
    }
    const replyMessage = await telegram.bot.sendMessage(msg.chat.id, `Adding new item\n*"${msg.text}"*\nChoose a type:`, {
      parse_mode: 'Markdown'
    });
    await telegram.bot.editMessageReplyMarkup({
      inline_keyboard: [buttons]
    }, {
      chat_id: replyMessage.chat.id,
      message_id: replyMessage.message_id
    });
  } catch (err) {
    console.log('hendleMessage ERROR: ', err);
  }
}