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

    // Initial channel list
    const channels = await db.channel.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    sendSSEEvent(controller, { type: 'channels', data: channels })

    // Watch for changes
    const interval = setInterval(async () => {
      const updatedChannels = await db.channel.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      })
      sendSSEEvent(controller, { type: 'channels', data: updatedChannels })
    }, 1000)

    request.signal.addEventListener('abort', () => {
      clearInterval(interval)
    })

    return response
  } catch (error) {
    console.error('Channel SSE error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
} 