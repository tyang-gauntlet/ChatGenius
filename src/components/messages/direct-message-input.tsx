'use client'

import { SharedMessageInput } from './shared-message-input'

interface MessageInputProps {
  userId: string
}

export function MessageInput({ userId }: MessageInputProps) {
  const sendMessage = async (content: string) => {
    const response = await fetch(`/api/direct-messages/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) throw new Error('Failed to send message')
  }

  return <SharedMessageInput onSendMessage={sendMessage} />
} 