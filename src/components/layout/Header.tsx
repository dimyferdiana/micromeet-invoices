import { Button } from "@/components/ui/button"
import { IconPlus } from "@tabler/icons-react"

interface HeaderProps {
  title: string
  subtitle?: string
  onCreateNew?: () => void
  createLabel?: string
}

export function Header({ title, subtitle, onCreateNew, createLabel = "Buat Baru" }: HeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-6 border-b mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {onCreateNew && (
        <Button onClick={onCreateNew} className="w-full sm:w-auto">
          <IconPlus className="h-4 w-4 mr-2" />
          {createLabel}
        </Button>
      )}
    </header>
  )
}
