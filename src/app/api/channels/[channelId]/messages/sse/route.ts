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
        Reaction: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Transform reactions into grouped format
    const transformedMessages = messages.map(message => ({
      ...message,
      reactions: Object.entries(
        message.Reaction.reduce((acc, reaction) => {
          acc[reaction.emoji] = acc[reaction.emoji] || { count: 0, hasReacted: false }
          acc[reaction.emoji].count++
          if (reaction.user.id === session?.user.id) {
            acc[reaction.emoji].hasReacted = true
          }
          return acc
        }, {} as Record<string, { count: number; hasReacted: boolean }>)
      ).map(([emoji, data]) => ({
        emoji,
        count: data.count,
        hasReacted: data.hasReacted,
      })),
    }))

    sendSSEEvent(controller, { 
      type: 'messages', 
      data: transformedMessages.reverse()
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
          Reaction: {
            include: {
              user: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
      
      // Transform reactions into grouped format
      const transformedUpdatedMessages = updatedMessages.map(message => ({
        ...message,
        reactions: Object.entries(
          message.Reaction.reduce((acc, reaction) => {
            acc[reaction.emoji] = acc[reaction.emoji] || { count: 0, hasReacted: false }
            acc[reaction.emoji].count++
            if (reaction.user.id === session?.user.id) {
              acc[reaction.emoji].hasReacted = true
            }
            return acc
          }, {} as Record<string, { count: number; hasReacted: boolean }>)
        ).map(([emoji, data]) => ({
          emoji,
          count: data.count,
          hasReacted: data.hasReacted,
        })),
      }))

      sendSSEEvent(controller, { 
        type: 'messages', 
        data: transformedUpdatedMessages.reverse()
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