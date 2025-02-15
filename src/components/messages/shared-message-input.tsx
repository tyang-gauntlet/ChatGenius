'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'

interface SharedMessageInputProps {
  onSendMessage: (content: string) => Promise<void>
}

export function SharedMessageInput({ onSendMessage }: SharedMessageInputProps) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const { toast } = useToast()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !session?.user) return

    setIsLoading(true)
    try {
      await onSendMessage(content)
      setContent('')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="p-4 border-t">
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          rows={1}
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !content.trim()}>
          Send
        </Button>
      </div>
    </form>
  )
} 