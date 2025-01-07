'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type User = {
  id: string
  username: string
  image?: string | null
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const pathname = usePathname()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users')
        if (!response.ok) throw new Error('Failed to fetch users')
        const data = await response.json()
        setUsers(data)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
  }, [])

  return (
    <ScrollArea className="h-[calc(100vh-10rem)]">
      <div className="space-y-1 p-2">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/direct-messages/${user.id}`}
            className={cn(
              "flex items-center px-2 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md",
              pathname === `/direct-messages/${user.id}` && "bg-accent"
            )}
          >
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={user.image || ''} />
              <AvatarFallback>{user.username[0]}</AvatarFallback>
            </Avatar>
            <span className="truncate">{user.username}</span>
          </Link>
        ))}
      </div>
    </ScrollArea>
  )
} 