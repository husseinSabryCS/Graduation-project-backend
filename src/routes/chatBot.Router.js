// routes/chat.js
const express = require('express');
const { getResponse } = require('../controllers/chatBot.controller');


const router = express.Router();

router.get('/', async (req, res) => {
  const { message } = req.query;
  if (!message) {
    return res.status(400).json({ error: 'يرجى توفير رسالة للحصول على رد' });
  }

  const reply = await getResponse(message);
  res.json({ reply });
});

module.exports = router;