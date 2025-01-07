"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { Hash } from 'lucide-react'
import { useSSE } from '@/hooks/use-sse'

interface Channel {
  id: string
  name: string
}

export function ChannelList({ channels: initialChannels }: { channels: Channel[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedChannelId = searchParams.get('channel')

  // Use SSE for real-time updates
  const channels = useSSE<Channel[]>('/api/channels/sse', initialChannels)

  const handleChannelClick = (channelId: string) => {
    router.push(`/channels?channel=${channelId}`)
  }

  if (!channels?.length) {
    return <div className="p-4 text-sm text-muted-foreground">No channels available</div>
  }

  return (
    <div className="space-y-2">
      {channels.map((channel) => (
        <button
          key={channel.id}
          onClick={() => handleChannelClick(channel.id)}
          className={`w-full flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-accent ${
            selectedChannelId === channel.id ? 'bg-accent' : ''
          }`}
        >
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{channel.name}</span>
        </button>
      ))}
    </div>
  )
} 