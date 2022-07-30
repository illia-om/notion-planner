import { TTelegramMessageRouter } from './../types';

export const hendleStart: TTelegramMessageRouter = async (telegram, { msg, match }) => {
    try {
        console.log('hendleStart: ', match![1], msg);
        if (match && typeof match[1] === 'string' && match[1].length > 0) {
            const userId = match[1];
            const user = await telegram.db.users.get(String(userId));
            if (!user) {
                telegram.bot.sendMessage(msg.chat.id, telegram.language.say('notLoggerIn'));
                return;
            }
            if (user.telegram_chat_id) {
                telegram.bot.sendMessage(msg.chat.id, 'You already loggedin');
            } else {
                const telegramUser = await telegram.db.telegramIntegration.get(String(msg.chat.id));
                console.log(telegramUser);
                if (telegramUser) {
                    telegram.bot.sendMessage(msg.chat.id, 'You did something wrong...');
                    return;
                }
                telegram.bot.sendMessage(msg.chat.id, 'Log you in...');
                const newTelegramUser = await telegram.db.telegramIntegration.insert({
                    userId: String(msg.chat.id),
                    firstName: msg.chat.first_name,
                    lastName: msg.chat.last_name,
                    username: msg.chat.username
                });
                console.log('New Telegram User: ', newTelegramUser);
                await telegram.db.users.saveTelegramConnection(userId, msg.chat.id);
                telegram.bot.sendMessage(msg.chat.id, 'You logged in now!\n');
            }
            if (user.notion_integration_id) {
                const notionIntegration = await telegram.db.notionIntegration.get(user.notion_integration_id)
                if (notionIntegration) {
                    telegram.bot.sendMessage(msg.chat.id, `Your connected notion workspace is: ${notionIntegration.workspace_icon} ${notionIntegration.workspace_name}`);
                    return;
                }
            }
            telegram.bot.sendMessage(msg.chat.id, `But you don't have notion integration installed.\nPlease visit our website to continue.\nhttps://illiaom.editorx.io/notion-planner/`);
            return;
        } else {
            telegram.bot.sendMessage(msg.chat.id, `You are not logged in 😕\nIn order to login, use the website.\nhttps://illiaom.editorx.io/notion-planner/`);
            return;
        }
    } catch (err) {
        console.log('hendleStart ERROR: ', err);
    }
}