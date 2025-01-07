import { ScrollArea } from "@/components/ui/scroll-area"
import { ChannelList } from "@/components/channels/channel-list"
import { UserList } from "@/components/users/user-list"
import { CreateChannelDialog } from "@/components/channels/create-channel-dialog"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Suspense } from "react"

async function ChannelSection() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const channels = await db.channel.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc'
    }
  })

  return <ChannelList channels={channels} />
}

async function UserSection() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const users = await db.user.findMany({
    where: {
      NOT: {
        id: session.user.id
      }
    },
    select: {
      id: true,
      username: true,
      updatedAt: true,
    },
    orderBy: {
      username: 'asc'
    }
  }).then(users => users.map(user => ({
    ...user,
    updatedAt: user.updatedAt.toISOString()
  })))

  return <UserList users={users} />
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r bg-background md:sticky md:w-[220px] lg:w-[240px]">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <h2 className="px-4 text-lg font-semibold">Channels</h2>
            <CreateChannelDialog />
          </div>
          <ScrollArea className="h-[300px] px-1">
            <Suspense fallback={<div>Loading channels...</div>}>
              <ChannelSection />
            </Suspense>
          </ScrollArea>
        </div>
        <div className="px-3 py-2">
          <h2 className="px-4 text-lg font-semibold">Direct Messages</h2>
          <ScrollArea className="h-[300px] px-1">
            <Suspense fallback={<div>Loading users...</div>}>
              <UserSection />
            </Suspense>
          </ScrollArea>
        </div>
      </div>
    </aside>
  )
} 