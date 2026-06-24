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
  const bgClass = className?.split(" ").find((c) => c.startsWith("bg-"))
  const otherClasses = className
    ?.split(" ")
    .filter((c) => !c.startsWith("bg-"))
    .join(" ")

  return (
    <div className={cn("relative flex w-full items-center sm:w-auto", otherClasses)}>
      <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("h-9 w-full pl-9 shadow-xs", bgClass || "bg-inherit")}
        disabled={disabled}
      />
    </div>
  )
}
