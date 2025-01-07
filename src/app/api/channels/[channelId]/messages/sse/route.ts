import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { initSSE, sendSSEEvent } from '@/lib/sse'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  context: { params: { channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { channelId } = await context.params

    const response = initSSE()
    const controller = (response as any).controller

    // Initial messages
    const messages = await db.message.findMany({
      where: { channelId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    sendSSEEvent(controller, { 
      type: 'messages', 
      data: messages.reverse()
    })

    // Watch for changes
    const interval = setInterval(async () => {
      const updatedMessages = await db.message.findMany({
        where: { channelId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
      
      sendSSEEvent(controller, { 
        type: 'messages', 
        data: updatedMessages.reverse()
      })
    }, 1000)

    request.signal.addEventListener('abort', () => {
      clearInterval(interval)
    })

    return response
  } catch (error) {
    console.error('Messages SSE error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
} 