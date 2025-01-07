'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { useSSE } from '@/hooks/use-sse'

interface Message {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    username: string
  }
}

interface MessageListProps {
  channelId: string
}

export function MessageList({ channelId }: MessageListProps) {
  const messages = useSSE<Message[]>(`/api/channels/${channelId}/messages/sse`, [])

  return (
    <div className="relative flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-4">
              <Avatar>
                <AvatarFallback>{message.user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{message.user.username}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(message.createdAt), 'h:mm a')}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 