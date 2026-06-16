import { useState } from "react"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"

interface EditableValueCellProps {
  configKey: string
  initialValue: string
  isSaving: boolean
  isBoolean: boolean
  onValueChange: (key: string, value: string) => void
}

export function EditableValueCell({
  configKey,
  initialValue,
  isSaving,
  isBoolean,
  onValueChange
}: EditableValueCellProps) {
  const [localValue, setLocalValue] = useState(initialValue)

  const handleChange = (val: string) => {
    setLocalValue(val)
    onValueChange(configKey, val)
  }

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
