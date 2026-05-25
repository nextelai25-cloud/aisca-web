export async function sendTelegram(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_GROUP_CHAT_ID

  if (!token || !chatId) {
    console.error('[Telegram] Missing credentials - TOKEN:', !!token, 'CHAT_ID:', !!chatId)
    return
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      }),
      signal: AbortSignal.timeout(10000)
    })

    const result = await response.json()
    
    if (!response.ok) {
      console.error('[Telegram] API error:', JSON.stringify(result))
    } else {
      console.log('[Telegram] Message sent successfully, message_id:', result.result?.message_id)
    }
  } catch (err: any) {
    console.error('[Telegram] Fetch error:', err.message)
  }
}
