import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Hash } from 'lucide-react'
import { MessageList } from '@/components/messages/message-list'
import { MessageInput } from '@/components/messages/message-input'

interface ChannelPageProps {
  params: Promise<{ channelId: string }>
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { channelId } = await params

  const channel = await db.channel.findUnique({
    where: { id: channelId },
    include: {
      members: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!channel) redirect('/channels')

  const isMember = channel.members.some(member => member.id === session.user.id)
  if (!isMember) redirect('/channels')

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center border-b px-6 py-4">
        <div className="flex items-center">
          <Hash className="h-5 w-5 text-muted-foreground" />
          <h1 className="ml-2 text-xl font-semibold">{channel.name}</h1>
        </div>
        {channel.description && (
          <p className="ml-4 text-sm text-muted-foreground">
            {channel.description}
          </p>
        )}
      </div>
      <MessageList channelId={channelId} />
      <MessageInput channelId={channelId} />
    </div>
  )
} 