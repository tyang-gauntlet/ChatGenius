'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface User {
  id: string
  username: string
}

export function UserList({ users }: { users: User[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedUserId = searchParams.get('dm')

  const handleUserClick = (userId: string) => {
    router.push(`/channels?dm=${userId}`)
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <button
          key={user.id}
          onClick={() => handleUserClick(user.id)}
          className={`w-full flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-accent ${
            selectedUserId === user.id ? 'bg-accent' : ''
          }`}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{user.username}</span>
        </button>
      ))}
    </div>
  )
} 