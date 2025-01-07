import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

const channelSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export async function PATCH(
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
    const { name, description } = channelSchema.parse(body)

    const updatedChannel = await db.channel.update({
      where: { id: channelId },
      data: { name, description },
    })

    return NextResponse.json(updatedChannel)
  } catch (error) {
    console.error('Channel update error:', error)
    return NextResponse.json(
      { error: 'Failed to update channel' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ channelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { channelId } = await context.params

    await db.channel.delete({
      where: { id: channelId },
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Channel delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete channel' },
      { status: 500 }
    )
  }
} 