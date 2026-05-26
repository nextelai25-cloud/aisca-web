const token = '8898132137:AAG0gkHfG8pSVHB9YOfjTdek9tonAodC1Qk';
const chatId = '-4993108929';

async function testTelegram() {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  console.log("Sending Telegram request...");
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '🔔 *AISCA Production Audit* \nTelegram connection test.',
        parse_mode: 'Markdown'
      })
    });
    
    const result = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response Body:", result);
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}

testTelegram();
