import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { ChannelList } from "@/components/channels/channel-list"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r bg-background md:sticky md:w-[220px] lg:w-[240px]">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Channels</h2>
          {/* Channel list will go here */}
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Direct Messages</h2>
          {/* DM list will go here */}
        </div>
      </div>
    </aside>
  )
} 