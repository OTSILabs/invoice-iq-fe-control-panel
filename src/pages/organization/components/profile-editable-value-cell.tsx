import { useState } from "react"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { useReferenceValues } from "@/api/hooks/useReferenceLists"
import { Loader2 } from "lucide-react"

interface EditableValueCellProps {
  configKey: string
  initialValue: string
  isSaving: boolean
  isBoolean: boolean
  referenceKey?: string | null
  onValueChange: (key: string, value: string) => void
}

export function EditableValueCell({
  configKey,
  initialValue,
  isSaving,
  isBoolean,
  referenceKey,
  onValueChange
}: EditableValueCellProps) {
  const [localValue, setLocalValue] = useState(initialValue)

  const handleChange = (val: string) => {
    setLocalValue(val)
    onValueChange(configKey, val)
  }

  // Fetch reference values if referenceKey is provided
  const { data: refValues = [], isLoading } = useReferenceValues(referenceKey || "")

  if (isBoolean) {
    return (
      <NativeSelect
        value={localValue || "false"}
        onChange={(e) => handleChange(e.target.value)}
        className="w-[180px]"
        disabled={isSaving}
      >
        <option value="true">true</option>
        <option value="false">false</option>
      </NativeSelect>
    )
  }

  if (referenceKey) {
    if (isLoading) {
      return (
        <div className="flex items-center gap-1.5 w-[180px] h-8 px-3 text-xs text-muted-foreground border border-input rounded-md bg-inherit">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Loading values...</span>
        </div>
      )
    }

    return (
      <NativeSelect
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        className="w-[180px]"
        disabled={isSaving}
      >
        <option value="">Select value...</option>
        {refValues.map((v) => (
          <option key={v.value_code} value={v.value_code}>
            {v.value_label || v.value_code}
          </option>
        ))}
      </NativeSelect>
    )
  }

  return (
    <Input
      placeholder="Enter value"
      value={localValue}
      onChange={(e) => handleChange(e.target.value)}
      className="h-8 text-xs w-[180px]"
      disabled={isSaving}
    />
  )
}

