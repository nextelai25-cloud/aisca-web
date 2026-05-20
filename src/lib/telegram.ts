export async function sendTelegram(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_GROUP_CHAT_ID

  console.log('Telegram token exists:', !!token)
  console.log('Telegram chatId:', chatId)

  if (!token || !chatId) {
    console.error('Missing Telegram credentials')
    return
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    })
    const result = await response.json()
    console.log('Telegram result:', JSON.stringify(result))
    return result
  } catch (err) {
    console.error('Telegram error:', err)
  }
}
