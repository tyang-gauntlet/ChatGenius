import { NextResponse } from 'next/server'
import { TextEncoder } from 'util'

export function initSSE() {
  const encoder = new TextEncoder()
  let controller: ReadableStreamDefaultController | null = null
  let isControllerClosed = false

  const stream = new ReadableStream({
    start(c) {
      controller = c
      const interval = setInterval(() => {
        if (!isControllerClosed && controller) {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'ping' })}\n\n`))
          } catch (error) {
            isControllerClosed = true
            clearInterval(interval)
          }
        }
      }, 30000)

      return () => {
        isControllerClosed = true
        clearInterval(interval)
      }
    },
  })

  const response = new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })

  ;(response as any).controller = controller

  return response
}

export function sendSSEEvent(controller: ReadableStreamDefaultController, data: unknown) {
  const encoder = new TextEncoder()
  try {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
  } catch (error) {
    console.error('Failed to send SSE event:', error)
  }
} 