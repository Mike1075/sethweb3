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
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      conversationId,
      userId,
    }),
  })

  if (!response.ok || !response.body) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.body
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