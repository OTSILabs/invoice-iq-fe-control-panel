import type { ProfileEditableValueCellProps } from "@/types"

import { EditableValueCell as SharedEditableValueCell } from "./editable-value-cell"

export function EditableValueCell(props: ProfileEditableValueCellProps) {
  return <SharedEditableValueCell {...props} />
}
