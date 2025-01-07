import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold">ChatGenius</h1>
        <div className="flex items-center gap-4">
          <Button>Click me</Button>
          <ThemeToggle />
        </div>
      </div>
    </main>
  )
}
