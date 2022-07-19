import { TTelegramMessageRouter } from './../types';

export const hendleStart: TTelegramMessageRouter = async (context, { msg, match }) => {
    try {
        console.log('hendleStart: ', match![1]);
        console.log('hendleStart: ', msg);
        if (match && typeof match[1] === 'string' && match[1].length > 0) {
            const userId = match[1];
            const { rows: user } = await context.db.getUserByUsername(userId);
            if (user.length === 0) {
                context.telegramBot.sendMessage(msg.chat.id, `You are not logged in 😕\nPlease visit our website to create an account.\nhttps://illiaom.editorx.io/notion-planner/`);
                return;
            }
            if (user[0].telegram_chat_id) {
                context.telegramBot.sendMessage(msg.chat.id, 'You already loggedin');
            } else {
                const { rows: telegramUser } = await context.db.getTelegramIntegrationByChatId(String(msg.chat.id));
                if (telegramUser.length > 0) {
                    context.telegramBot.sendMessage(msg.chat.id, 'You did something wrong...');
                    return;
                }
                context.telegramBot.sendMessage(msg.chat.id, 'Log in...');
                const { rows: newTelegramUser } = await context.db.insertTelegramIntegration({
                    userId: String(msg.chat.id),
                    firstName: msg.chat.first_name,
                    lastName: msg.chat.last_name,
                    username: msg.chat.username
                });
                console.log('New Telegram User: ', newTelegramUser[0]);
                const { rows: user } = await context.db.updateUserTelegramIntegration(userId, String(msg.chat.id));
                context.telegramBot.sendMessage(msg.chat.id, 'You already loggedin now!\n');
            }
            if (user[0].notion_integration_id) {
                const { rows: notionIntegration } = await context.db.getNotionIntegrationById(user[0].notion_integration_id)
                context.telegramBot.sendMessage(msg.chat.id, `Your connected notion workspace is: ${notionIntegration[0].workspace_icon} ${notionIntegration[0].workspace_name}`);
                return;
            }
            context.telegramBot.sendMessage(msg.chat.id, `But you don't have notion integration installed.\nPlease visit our website to continue.\nhttps://illiaom.editorx.io/notion-planner/`);
            return;
            console.log(user);
        } else {
            context.telegramBot.sendMessage(msg.chat.id, `You are not logged in 😕\nIn order to login, use the website.\nhttps://illiaom.editorx.io/notion-planner/`);
            return;
        }
    } catch (err) {
        console.log('hendleStart ERROR: ', err);
    }
}