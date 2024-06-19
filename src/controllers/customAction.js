// customAction.js
const { getResponse } = require('./chatBot.js'); // قم بتعديل المسار حسب هيكل مشروعك

async function customAction(bp, event, args) {
  const userMessage = event.text;
  const botResponse = await getResponse(userMessage);

  // أرسل رد الروبوت مباشرة إلى المستخدم
  bp.messages.sendText(event.channel, botResponse);
}

return customAction;
