import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { EventEmitter } from 'events'

const messageSchema = z.object({
  content: z.string().min(1),
})

const messageEmitter = new EventEmitter()

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ channelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { channelId } = await context.params
    const body = await request.json()
    const { content } = messageSchema.parse(body)

    const message = await db.message.create({
      data: {
        content,
        channelId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    })

    messageEmitter.emit(`message:${channelId}`, message)
    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      console.error('Message error:', error.message)
    }
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ channelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { channelId } = await context.params
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

    return NextResponse.json(messages)
  } catch (error) {
    if (error instanceof Error) {
      console.error('Message error:', error.message)
    }
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export { messageEmitter } 