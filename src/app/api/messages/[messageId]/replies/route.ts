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

    const { content } = await request.json()
    const { messageId } = await params

    const reply = await db.message.create({
      data: {
        content,
        userId: session.user.id,
        parentId: messageId,
      },
    })

    // Update reply count
    await db.message.update({
      where: { id: messageId },
      data: {
        replyCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json(reply)
  } catch (error) {
    console.error('Reply error:', error)
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    )
  }
} 