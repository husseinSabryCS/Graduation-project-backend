// chatBot.js
const { NlpManager } = require('node-nlp');
const dataSet = require('./dataSet.json'); // تعديل مسار ملف البيانات حسب موقعه الفعلي

const defaultResponses = [
  'عذرًا، لم أتمكن من فهم سؤالك. هل يمكنك إعادة صياغته؟',
  'عفوًا، يبدو أن هناك خطأ في فهم السؤال. هل يمكنك طرح سؤال آخر؟',
  'آسف، لم أستطع فهم طلبك. هل تستطيع توضيحه بشكل أفضل؟'
];

const manager = new NlpManager({ languages: ['ar'] });

// دالة لمعالجة النصوص وتعديل الهمزة والتاء المربوطة
const processText = (text) => {
  return text.replace(/أ|إ/g, 'ا').replace(/ة/g, 'ه');
};

dataSet.intents.forEach(({ patterns, responses }) => {
  patterns.forEach((pattern) => {
    // تطبيق دالة processText على النصوص في ملف البيانات
    const processedPattern = processText(pattern);
    manager.addDocument('ar', processedPattern, responses);
  });
});

manager.train();

const getResponse = async (message) => {
  const { classifications } = await manager.process('ar', message);
  const classification = classifications.find((cls) => cls.intent && cls.intent !== 'None' && cls.score > 0.5);

  if (classification && classification.intent && classification.intent !== 'None') {
    return classification.intent;
  } else {
    const randomIndex = Math.floor(Math.random() * defaultResponses.length);
    return defaultResponses[randomIndex];
  }
};

module.exports = { getResponse };
