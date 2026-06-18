import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
  disabled,
}: SearchInputProps) {
  return (
    <div className={cn("relative flex items-center w-full sm:w-auto", className)}>
      <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 h-9 bg-inherit w-full"
        disabled={disabled}
      />
    </div>
  )
}
