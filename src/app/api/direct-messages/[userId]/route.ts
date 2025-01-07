import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

const messageSchema = z.object({
  content: z.string().min(1),
})

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await context.params
    const body = await request.json()
    const { content } = messageSchema.parse(body)

    const message = await db.directMessage.create({
      data: {
        content,
        fromUserId: session.user.id,
        toUserId: userId,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      console.error('Direct message error:', error.message)
    }
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await context.params

    const messages = await db.directMessage.findMany({
      where: {
        OR: [
          {
            fromUserId: session.user.id,
            toUserId: userId,
          },
          {
            fromUserId: userId,
            toUserId: session.user.id,
          },
        ],
      },
      include: {
        fromUser: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return NextResponse.json(messages)
  } catch (error) {
    if (error instanceof Error) {
      console.error('Direct message error:', error.message)
    }
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
} 