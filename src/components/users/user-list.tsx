'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { usePresence } from '@/hooks/use-presence'

interface User {
  id: string
  username: string
  status: string
  lastSeen: string
}

export function UserList({ users: initialUsers }: { users: User[] }) {
  const [users, setUsers] = useState(initialUsers)
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedUserId = searchParams.get('dm')

  usePresence()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/presence')
        if (!response.ok) throw new Error('Failed to fetch users')
        const data = await response.json()
        setUsers(data)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
    const interval = setInterval(fetchUsers, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <button
          key={user.id}
          onClick={() => router.push(`/channels?dm=${user.id}`)}
          className={`w-full flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-accent ${
            selectedUserId === user.id ? 'bg-accent' : ''
          }`}
        >
          <div className="relative">
            <Avatar>
              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                user.status === 'online'
                  ? 'bg-green-500'
                  : user.status === 'away'
                  ? 'bg-yellow-500'
                  : 'bg-gray-500'
              }`}
            />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{user.username}</span>
            <span className="text-xs text-muted-foreground">
              {user.status === 'online'
                ? 'Online'
                : user.status === 'away'
                ? 'Away'
                : 'Offline'}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
} 