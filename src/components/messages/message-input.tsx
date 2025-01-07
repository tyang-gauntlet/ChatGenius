'use client'

import { SharedMessageInput } from './shared-message-input'

interface MessageInputProps {
  channelId: string
}

export function MessageInput({ channelId }: MessageInputProps) {
  const sendMessage = async (content: string) => {
    const response = await fetch(`/api/channels/${channelId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) throw new Error('Failed to send message')
  }

  return <SharedMessageInput onSendMessage={sendMessage} />
} 