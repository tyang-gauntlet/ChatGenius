'use client'

import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSSE } from '@/hooks/use-sse'
import { Message } from './message'
import { Thread } from './thread'

interface MessageData {
  id: string
  content: string
  createdAt: string
  replyCount: number
  user: {
    id: string
    username: string
  }
}

interface MessageListProps {
  channelId: string
}

export function MessageList({ channelId }: MessageListProps) {
  const messages = useSSE<MessageData[]>(`/api/channels/${channelId}/messages/sse`, [])
  const [activeThread, setActiveThread] = useState<MessageData | null>(null)

  const handleThreadOpen = (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (message) setActiveThread(message)
  }

  return (
    <div className="flex h-full">
      <div className={`flex-1 ${activeThread ? 'hidden md:block' : ''}`}>
        <ScrollArea className="h-full">
          <div className="space-y-2">
            {messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                onThreadOpen={handleThreadOpen}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {activeThread && (
        <div className="w-full md:w-[400px]">
          <Thread
            parentMessage={activeThread}
            onClose={() => setActiveThread(null)}
          />
        </div>
      )}
    </div>
  )
} 