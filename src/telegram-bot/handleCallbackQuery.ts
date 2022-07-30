import { TTelegramCallbackQueryRouter } from './../types';
import { Notion } from './../services/notion';

export const handleCallbackQuery: TTelegramCallbackQueryRouter = async (telegram, { callbackQuery }) => {
  try {
    const parseRegExp = /type=(.*?)text=(.*)/gm;
    if (!callbackQuery.data) {
      return;
    }
    const match = parseRegExp.exec(callbackQuery.data);
    const itemType = match![1];
    const itemText = match![2];
    console.log({ itemType, itemText });
    const isUserLoaded = await telegram.withUser(callbackQuery);
    if (!isUserLoaded) {
      return;
    }
    const isNotionLoaded = await telegram.withNotion(callbackQuery);
    if (!isNotionLoaded) {
      return;
    }
    const result = await telegram.notion!.addToInbox(itemText, itemType);
    console.log(result);
    if (result) {
      telegram.bot.sendMessage(callbackQuery.from.id, telegram.language.say('addedToPlanner'));
    } else {
      telegram.bot.sendMessage(callbackQuery.from.id, telegram.language.say('errorMessage'));
    }
  } catch (err) {
    console.log('handleCallbackQuery ERROR: ', err);
  }
}