import { TTelegramCallbackQueryRouter } from './../types';
import { Notion } from './../services/notion';

export const handleCallbackQuery: TTelegramCallbackQueryRouter = async (telegram, { callbackQuery }) => {
  try {
    const parseRegExp = /(.*?):(.*)/gm;
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
    const resources = await telegram.notion!.listAllRecources();
    console.log(resources);
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
    console.log('handleCallbackQuery ERROR: ', err);
  }
}