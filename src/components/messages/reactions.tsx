'use client'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Smile } from 'lucide-react'

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🚀', '👀']

interface ReactionGroup {
  emoji: string
  count: number
  hasReacted: boolean
}

interface ReactionsProps {
  messageId: string
  reactions: ReactionGroup[]
  onReact: (emoji: string) => Promise<void>
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  buttonClassName?: string
}

export function Reactions({ 
  messageId, 
  reactions, 
  onReact,
  isOpen,
  onOpenChange,
  buttonClassName = ""
}: ReactionsProps) {
  const handleReact = async (emoji: string) => {
    await onReact(emoji)
    onOpenChange(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={buttonClassName}
        >
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="end">
        <div className="flex gap-2">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className="text-lg hover:bg-accent p-1 rounded"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
} 