'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { MessageCircle, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reactions } from './reactions'

interface MessageProps {
  message: {
    id: string
    content: string
    createdAt: string
    replyCount: number
    reactions: Array<{
      emoji: string
      count: number
      hasReacted: boolean
    }>
    user: {
      id: string
      username: string
    }
  }
  onThreadOpen: (messageId: string) => void
}

export function Message({ message, onThreadOpen }: MessageProps) {
  const [showActions, setShowActions] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(false)

  const handleReact = async (emoji: string) => {
    try {
      const response = await fetch(`/api/messages/${message.id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to react')
      }
    } catch (error) {
      console.error('Failed to add reaction:', error)
    }
  }

  return (
    <div 
      className="group relative flex items-start gap-4 py-2 px-4 hover:bg-accent/5"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false)
        setShowReactionPicker(false)
      }}
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
        {message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {message.reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => handleReact(reaction.emoji)}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs hover:bg-accent ${
                  reaction.hasReacted ? 'bg-accent' : 'bg-muted'
                }`}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </button>
            ))}
          </div>
        )}
        {message.replyCount > 0 && (
          <button
            onClick={() => onThreadOpen(message.id)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="h-3 w-3" />
            {message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}
          </button>
        )}
      </div>
      {showActions && (
        <div className="absolute right-4 top-2 flex gap-2">
          <Reactions
            messageId={message.id}
            reactions={message.reactions}
            onReact={handleReact}
            isOpen={showReactionPicker}
            onOpenChange={setShowReactionPicker}
            buttonClassName="h-8 w-8"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onThreadOpen(message.id)}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
} 