const DIFY_API_URL = process.env.DIFY_API_URL || 'https://pro.aifunbox.com/v1/'
const DIFY_API_KEY = process.env.DIFY_API_KEY || 'app-tEivDPsjZY6phvYSqscy9Cqr'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export async function sendMessageToDify(
  message: string,
  conversationId?: string,
  userId?: string
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(`${DIFY_API_URL}chat-messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DIFY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {},
      query: message,
      response_mode: 'streaming',
      conversation_id: conversationId,
      user: userId || 'anonymous',
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.body!
}

export function parseStreamResponse(chunk: string): Array<{ event: string; answer?: string; conversation_id?: string }> {
  const lines = chunk.split('\n')
  const results: Array<{ event: string; answer?: string; conversation_id?: string }> = []
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        const data = JSON.parse(line.slice(6))
        results.push(data)
      } catch {
        // 忽略解析错误
      }
    }
  }
  
  return results
}