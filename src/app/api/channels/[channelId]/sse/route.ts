import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const db = new PrismaClient()

interface MessageWithUser {
  id: string
  content: string
  createdAt: Date
  user: {
    id: string
    username: string
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ channelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { channelId } = await context.params

    // Verify channel exists and user is a member
    const channel = await db.channel.findUnique({
      where: { id: channelId },
      include: { members: { select: { id: true } } }
    })

    if (!channel) {
      return new Response(JSON.stringify({ error: 'Channel not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const isMember = channel.members.some(member => member.id === session.user?.id)
    if (!isMember) {
      return new Response(JSON.stringify({ error: 'Not a member' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const sendMessage = (data: { type: string; messages?: MessageWithUser[]; error?: string }) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        }

        try {
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

          sendMessage({ 
            type: 'initial', 
            messages: messages.reverse().map(msg => ({
              ...msg,
              user: {
                id: msg.user.id,
                username: msg.user.username || 'Unknown User'
              }
            }))
          })

          // Keep connection alive
          const keepAlive = setInterval(() => {
            sendMessage({ type: 'ping' })
          }, 30000)

          // Cleanup
          request.signal.addEventListener('abort', () => {
            clearInterval(keepAlive)
          })
        } catch (error) {
          sendMessage({ type: 'error', error: 'Failed to fetch messages' })
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('SSE error:', error instanceof Error ? error.message : 'Unknown error')
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 