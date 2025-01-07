'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MessageProps {
  message: {
    id: string
    content: string
    createdAt: string
    replyCount: number
    user: {
      id: string
      username: string
    }
  }
  onThreadOpen: (messageId: string) => void
}

export function Message({ message, onThreadOpen }: MessageProps) {
  const [showReply, setShowReply] = useState(false)

  return (
    <div 
      className="group relative flex items-start gap-4 py-2 px-4 hover:bg-accent/5"
      onMouseEnter={() => setShowReply(true)}
      onMouseLeave={() => setShowReply(false)}
    >
      <Avatar>
        <AvatarFallback>{message.user.username[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 grid gap-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{message.user.username}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.createdAt), 'h:mm a')}
          </span>
        </div>
        <p className="text-sm">{message.content}</p>
        {message.replyCount > 0 && (
          <button
            onClick={() => onThreadOpen(message.id)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mt-1"
          >
            <MessageCircle className="h-3 w-3" />
            {message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}
          </button>
        )}
      </div>
      {showReply && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-2"
          onClick={() => onThreadOpen(message.id)}
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
} 