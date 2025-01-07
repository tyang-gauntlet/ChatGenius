import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { emoji } = await request.json()
    const { messageId } = await params

    // Validate message exists
    const message = await db.message.findUnique({
      where: { id: messageId }
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Check if user has already reacted with this emoji
    const existingReaction = await db.reaction.findFirst({
      where: {
        messageId,
        userId: session.user.id,
        emoji,
      },
    })

    if (existingReaction) {
      // Remove reaction if it exists
      await db.reaction.delete({
        where: { id: existingReaction.id },
      })
    } else {
      // Add new reaction
      await db.reaction.create({
        data: {
          emoji,
          userId: session.user.id,
          messageId,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reaction error:', error)
    return NextResponse.json(
      { error: 'Failed to update reaction' },
      { status: 500 }
    )
  }
} 