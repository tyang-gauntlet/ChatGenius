import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { initSSE, sendSSEEvent } from '@/lib/sse'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { messageId } = await params

    const response = initSSE()
    const controller = (response as any).controller

    // Initial replies
    const replies = await db.message.findMany({
      where: { 
        parentId: messageId 
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    sendSSEEvent(controller, { type: 'replies', data: replies })

    // Watch for changes
    const interval = setInterval(async () => {
      const updatedReplies = await db.message.findMany({
        where: { 
          parentId: messageId 
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      })
      
      sendSSEEvent(controller, { type: 'replies', data: updatedReplies })
    }, 1000)

    request.signal.addEventListener('abort', () => {
      clearInterval(interval)
    })

    return response
  } catch (error) {
    console.error('Thread replies SSE error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
} 