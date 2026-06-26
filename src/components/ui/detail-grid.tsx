import * as React from "react"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// DetailGrid — metadata grid with clean ruled dividers at every breakpoint.
//
// Usage:
//   <DetailGrid cols={{ default: 1, sm: 2, lg: 3 }}>
//     <DetailGrid.Item label="Status">...</DetailGrid.Item>
//     <DetailGrid.Item label="Created">...</DetailGrid.Item>
//   </DetailGrid>
//
//   cols shortcuts (pass a number):
//     2  → { default: 1, sm: 2 }
//     3  → { default: 1, sm: 2, lg: 3 }
//     4  → { default: 2, sm: 2, lg: 4 }
//     6  → { default: 2, sm: 3, lg: 6 }
// ─────────────────────────────────────────────────────────────────────────────

type ColsShorthand = 2 | 3 | 4 | 6

interface ColsConfig {
  default: number
  sm?: number
  lg?: number
}

type ColsProp = ColsShorthand | ColsConfig

const shorthandMap: Record<ColsShorthand, ColsConfig> = {
  2: { default: 1, sm: 2 },
  3: { default: 1, sm: 2, lg: 3 },
  4: { default: 2, sm: 2, lg: 4 },
  6: { default: 2, sm: 3, lg: 6 },
}

const gridColsClass: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  6: "grid-cols-6",
}

const smColsClass: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  6: "sm:grid-cols-6",
}

const lgColsClass: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  6: "lg:grid-cols-6",
}

// ── Context so Item knows its index and the resolved cols ────────────────────

interface GridCtx {
  cols: ColsConfig
  total: number
}

const GridContext = React.createContext<GridCtx>({ cols: { default: 1 }, total: 0 })

// ── DetailGrid ───────────────────────────────────────────────────────────────

interface DetailGridProps {
  cols?: ColsProp
  children: React.ReactNode
  className?: string
}

function DetailGrid({ cols = 3, children, className }: DetailGridProps) {
  const resolved: ColsConfig =
    typeof cols === "number" ? shorthandMap[cols as ColsShorthand] : cols

  const items = React.Children.toArray(children)
  const total = items.length

  const colClasses = [
    gridColsClass[resolved.default] ?? "grid-cols-1",
    resolved.sm ? smColsClass[resolved.sm] : "",
    resolved.lg ? lgColsClass[resolved.lg] : "",
  ].filter(Boolean).join(" ")

  return (
    <GridContext.Provider value={{ cols: resolved, total }}>
      <div data-slot="detail-grid" className={cn("grid border-t border-border/40", colClasses, className)}>
        {items.map((child, index) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<DetailGridItemProps>, { _index: index })
            : child
        )}
      </div>
    </GridContext.Provider>
  )
}

// ── DetailGrid.Item ──────────────────────────────────────────────────────────

interface DetailGridItemProps {
  label: string
  children: React.ReactNode
  className?: string
  /** injected by DetailGrid — do not pass manually */
  _index?: number
}

function DetailGridItem({ label, children, className, _index = 0 }: DetailGridItemProps) {
  const { cols, total } = React.useContext(GridContext)

  // At each breakpoint, add a right border unless the cell is the last in its row.
  // Add a bottom border unless the cell is in the last row.
  // We compute this with CSS custom properties so it works without JS resize logic.
  // Strategy: always show right + bottom borders; the grid wrapper has border-t,
  // each cell has border-b and border-r, and the rightmost cell in each row has
  // border-r removed via nth-child selectors applied via className.

  // Determine position classes for right-border suppression at each breakpoint.
  const { default: dCols, sm: smCols, lg: lgCols } = cols

  const col_d = (_index % dCols) + 1
  const col_sm = smCols ? (_index % smCols) + 1 : null
  const col_lg = lgCols ? (_index % lgCols) + 1 : null

  const isLastCol_d = col_d === dCols
  const isLastCol_sm = col_sm !== null && col_sm === smCols
  const isLastCol_lg = col_lg !== null && col_lg === lgCols

  // Last row detection: which row does this item sit in at each breakpoint?
  const lastRowStart_d = Math.floor((total - 1) / dCols) * dCols
  const lastRowStart_sm = smCols ? Math.floor((total - 1) / smCols) * smCols : null
  const lastRowStart_lg = lgCols ? Math.floor((total - 1) / lgCols) * lgCols : null

  const isLastRow_d = _index >= lastRowStart_d
  const isLastRow_sm = lastRowStart_sm !== null && _index >= lastRowStart_sm
  const isLastRow_lg = lastRowStart_lg !== null && _index >= lastRowStart_lg

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 px-4 py-3",
        // right border — always on, removed at last col per breakpoint
        "border-r border-border/40",
        isLastCol_d && "border-r-0",
        isLastCol_sm && "sm:border-r-0",
        !isLastCol_sm && smCols && "sm:border-r",
        isLastCol_lg && "lg:border-r-0",
        !isLastCol_lg && lgCols && "lg:border-r",
        // bottom border — always on, removed at last row per breakpoint
        "border-b border-border/40",
        isLastRow_d && "border-b-0",
        isLastRow_sm && "sm:border-b-0",
        !isLastRow_sm && smCols && "sm:border-b",
        isLastRow_lg && "lg:border-b-0",
        !isLastRow_lg && lgCols && "lg:border-b",
        className
      )}
    >
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

DetailGrid.Item = DetailGridItem

export { DetailGrid }
export type { ColsProp as DetailGridCols }