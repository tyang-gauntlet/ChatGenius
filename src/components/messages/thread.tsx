'use client'

import { useSSE } from '@/hooks/use-sse'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { SharedMessageInput } from './shared-message-input'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ThreadMessage {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    username: string
  }
}

interface ThreadProps {
  parentMessage: ThreadMessage
  onClose: () => void
}

export function Thread({ parentMessage, onClose }: ThreadProps) {
  const replies = useSSE<ThreadMessage[]>(`/api/messages/${parentMessage.id}/replies/sse`, [])

  const sendReply = async (content: string) => {
    const response = await fetch(`/api/messages/${parentMessage.id}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) throw new Error('Failed to send reply')
  }

  return (
    <div className="flex flex-col h-full border-l">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h2 className="text-lg font-semibold">Thread</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {/* Original Message */}
            <div className="flex items-start gap-4 pb-4 border-b">
              <Avatar>
                <AvatarFallback>
                  {parentMessage.user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{parentMessage.user.username}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(parentMessage.createdAt), 'h:mm a')}
                  </span>
                </div>
                <p className="text-sm">{parentMessage.content}</p>
              </div>
            </div>

            {/* Replies */}
            <div className="space-y-4">
              {replies.map((reply) => (
                <div key={reply.id} className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {reply.user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{reply.user.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(reply.createdAt), 'h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      <div className="border-t">
        <SharedMessageInput onSendMessage={sendReply} />
      </div>
    </div>
  )
} 