import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { initSSE, sendSSEEvent } from '@/lib/sse'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const response = initSSE()
    const controller = (response as any).controller

    // Initial user list
    const users = await db.user.findMany({
      where: {
        NOT: {
          id: session.user.id,
        },
      },
      select: {
        id: true,
        username: true,
      },
      orderBy: {
        username: 'asc',
      },
    })

    sendSSEEvent(controller, { type: 'users', data: users })

    // Watch for changes
    const interval = setInterval(async () => {
      const updatedUsers = await db.user.findMany({
        where: {
          NOT: {
            id: session.user.id,
          },
        },
        select: {
          id: true,
          username: true,
        },
        orderBy: {
          username: 'asc',
        },
      })
      sendSSEEvent(controller, { type: 'users', data: updatedUsers })
    }, 1000)

    request.signal.addEventListener('abort', () => {
      clearInterval(interval)
    })

    return response
  } catch (error) {
    console.error('Users SSE error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
} 