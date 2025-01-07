import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

const channelSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description } = channelSchema.parse(body)

    const channel = await db.channel.create({
      data: {
        name,
        description,
        ownerId: session.user.id,
        members: {
          connect: { id: session.user.id }
        }
      },
    })

    return NextResponse.json(channel, { status: 201 })
  } catch (error) {
    console.error('Channel creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const channels = await db.channel.findMany({
      where: {
        members: {
          some: {
            id: session.user.id
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(channels)
  } catch (error) {
    console.error('Channel fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 