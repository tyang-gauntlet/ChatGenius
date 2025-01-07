import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { DirectMessagePanel } from '@/components/messages/direct-message-panel'
import { Hash } from 'lucide-react'
import { MessageList } from '@/components/messages/message-list'
import { MessageInput } from '@/components/messages/message-input'
import { EditChannelDialog } from '@/components/channels/edit-channel-dialog'

interface PageProps {
  searchParams: {
    dm?: string
    channel?: string
  }
}

export default async function ChannelsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { dm, channel } = await searchParams

  // Handle DM user selection
  let selectedUser = null
  if (dm) {
    selectedUser = await db.user.findUnique({
      where: { id: dm },
      select: {
        id: true,
        username: true,
      },
    })
  }

  // Handle channel selection without membership check
  let selectedChannel = null
  if (channel) {
    selectedChannel = await db.channel.findUnique({
      where: { id: channel },
      select: {
        id: true,
        name: true,
        description: true,
      }
    })
  }

  return (
    <div className="flex flex-col h-full">
      {selectedUser ? (
        <DirectMessagePanel user={selectedUser} />
      ) : selectedChannel ? (
        <div className="flex flex-col h-full">
          <div className="flex items-center border-b px-6 py-4 shrink-0">
            <div className="flex items-center flex-1">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <h1 className="ml-2 text-xl font-semibold">{selectedChannel.name}</h1>
              {selectedChannel.description && (
                <p className="ml-4 text-sm text-muted-foreground">
                  {selectedChannel.description}
                </p>
              )}
            </div>
            <EditChannelDialog channel={selectedChannel} />
          </div>
          <div className="flex-1 min-h-0">
            <MessageList channelId={selectedChannel.id} />
          </div>
          <div className="shrink-0 border-t bg-background px-4 py-3">
            <MessageInput channelId={selectedChannel.id} />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Select a channel or user to start messaging
        </div>
      )}
    </div>
  )
} 