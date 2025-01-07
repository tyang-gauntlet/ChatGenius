'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { z } from 'zod'

const userSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6),
})

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLogin) {
        const result = await signIn('credentials', {
          username,
          password,
          redirect: false,
        })

        if (result?.error) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Invalid username or password',
          })
          return
        }

        router.push('/channels')
      } else {
        // Register new user
        const validation = userSchema.safeParse({ username, password })
        if (!validation.success) {
          toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: validation.error.errors[0].message,
          })
          return
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        })

        const data = await response.json()

        if (!response.ok) {
          toast({
            variant: 'destructive',
            title: 'Registration Error',
            description: data.error || 'Failed to register',
          })
          return
        }

        // Auto login after registration
        const loginResult = await signIn('credentials', {
          username,
          password,
          redirect: false,
        })

        if (loginResult?.error) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Registration successful but failed to log in',
          })
          return
        }

        router.push('/channels')
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{isLogin ? 'Login' : 'Register'}</h1>
          <p className="text-sm text-muted-foreground">
            {isLogin
              ? 'Welcome back! Please login to continue.'
              : 'Create an account to get started.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username">Username</label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLogin ? 'Login' : 'Register'}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            disabled={isLoading}
          >
            {isLogin
              ? "Don't have an account? Register"
              : 'Already have an account? Login'}
          </Button>
        </div>
      </div>
    </div>
  )
} 