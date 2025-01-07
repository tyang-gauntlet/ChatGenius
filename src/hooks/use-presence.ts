'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function usePresence() {
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user) return

    const updatePresence = async (status: 'online' | 'offline' | 'away') => {
      try {
        await fetch('/api/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
      } catch (error) {
        console.error('Failed to update presence:', error)
      }
    }

    // Set initial presence
    updatePresence('online')

    // Update presence before tab/window close
    const handleBeforeUnload = () => {
      updatePresence('offline')
    }

    // Update presence on visibility change
    const handleVisibilityChange = () => {
      updatePresence(document.hidden ? 'away' : 'online')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Ping presence every 30 seconds
    const interval = setInterval(() => {
      updatePresence('online')
    }, 30000)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
      updatePresence('offline')
    }
  }, [session])
} 