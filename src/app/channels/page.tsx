import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { DirectMessagePanel } from '@/components/messages/direct-message-panel'
import { Hash } from 'lucide-react'
import { MessageList } from '@/components/messages/message-list'
import { MessageInput } from '@/components/messages/message-input'

interface PageProps {
  searchParams: {
    dm?: string
    channel?: string
  }
}

export default async function ChannelsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Handle DM user selection
  let selectedUser = null
  if (searchParams?.dm) {
    selectedUser = await db.user.findUnique({
      where: { id: searchParams.dm },
      select: {
        id: true,
        username: true,
      },
    })
  }

  // Handle channel selection
  let selectedChannel = null
  if (searchParams?.channel) {
    selectedChannel = await db.channel.findUnique({
      where: { id: searchParams.channel },
      include: {
        members: {
          select: {
            id: true,
          },
        },
      },
    })

    if (selectedChannel) {
      const isMember = selectedChannel.members.some(member => member.id === session.user.id)
      if (!isMember) {
        selectedChannel = null
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      {selectedUser ? (
        <DirectMessagePanel user={selectedUser} />
      ) : selectedChannel ? (
        <div className="flex flex-col h-full">
          <div className="flex items-center border-b px-6 py-4">
            <div className="flex items-center">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <h1 className="ml-2 text-xl font-semibold">{selectedChannel.name}</h1>
            </div>
            {selectedChannel.description && (
              <p className="ml-4 text-sm text-muted-foreground">
                {selectedChannel.description}
              </p>
            )}
          </div>
          <MessageList channelId={selectedChannel.id} />
          <MessageInput channelId={selectedChannel.id} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Select a channel or user to start messaging
        </div>
      )}
    </div>
  )
} 