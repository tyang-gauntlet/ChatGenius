'use client'

import { useEffect, useState } from 'react'

export function useSSE<T>(url: string, initialData: T) {
  const [data, setData] = useState<T>(initialData)

  useEffect(() => {
    const eventSource = new EventSource(url)

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data)
        if (parsedData.type === 'ping') return
        setData(parsedData.data)
      } catch (error) {
        console.error('SSE parse error:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE error:', error)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [url])

  return data
} 