import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, userId } = await request.json()

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid message' }), { status: 400 })
    }

    const apiUrl = process.env.DIFY_API_URL || 'https://pro.aifunbox.com/v1/'
    const apiKey = process.env.DIFY_API_KEY

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing DIFY_API_KEY' }), { status: 500 })
    }

    const upstream = await fetch(`${apiUrl}chat-messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
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

    if (!upstream.ok || !upstream.body) {
      return new Response(JSON.stringify({ error: `Upstream error: ${upstream.status}` }), { status: 502 })
    }

    // 直接透传流式响应
    const headers = new Headers({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    })

    return new Response(upstream.body, { headers })
  } catch {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}

