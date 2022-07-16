import { TTelegramRouter } from './../types';

export const hendleMessage: TTelegramRouter = (context, { msg }) => {
    console.log('hendleMessage: ', msg);
    if (msg.entities && msg.entities[0].type === 'bot_command') {
        return;
    }
    context.telegramBot.sendMessage(msg.chat.id, msg.text!);
}