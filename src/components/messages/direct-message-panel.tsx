'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageList } from '@/components/messages/direct-message-list'
import { MessageInput } from '@/components/messages/direct-message-input'

interface DirectMessagePanelProps {
  user: {
    id: string
    username: string
  }
}

export function DirectMessagePanel({ user }: DirectMessagePanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center border-b px-6 py-4">
        <div className="flex items-center">
          <Avatar>
            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="ml-2 text-xl font-semibold">{user.username}</div>
        </div>
      </div>
      <MessageList userId={user.id} />
      <MessageInput userId={user.id} />
    </div>
  )
} 