import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { MessageList } from '@/components/messages/direct-message-list'
import { MessageInput } from '@/components/messages/direct-message-input'

interface DirectMessagePageProps {
  params: {
    userId: string
  }
}

export default async function DirectMessagePage({ params }: DirectMessagePageProps) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const otherUser = await db.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!otherUser) redirect('/channels')

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center border-b px-6 py-4">
        <div className="flex items-center">
          <div className="ml-2 text-xl font-semibold">{otherUser.username}</div>
        </div>
      </div>
      <MessageList userId={params.userId} />
      <MessageInput userId={params.userId} />
    </div>
  )
}