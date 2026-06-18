import { useState, useMemo } from "react"
import { ShieldCheck, Plus, RefreshCw, MoreVertical, Edit, Eye, Trash2, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import type { CustomColumnDef } from "@/components/ui/data-table"
import { SearchInput } from "@/components/search-input"
import { useNormalizationRules, useDeleteNormalizationRuleMutation } from "@/api/hooks/normalization-rules"
import type { NormalizationRule } from "@/types"
import { NormalizationRuleDialog } from "./modals/normalization-rule-dialog"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export function NormalizationRules() {
  const navigate = useNavigate()
  const { data: rules = [], isLoading, refetch, isFetching } = useNormalizationRules()
  const [searchText, setSearchText] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<NormalizationRule | null>(null)
  const [deletingRule, setDeletingRule] = useState<NormalizationRule | null>(null)

  const { mutate: deleteRule, isPending: isDeleting } = useDeleteNormalizationRuleMutation()

  const handleRefetch = async () => {
    try {
      await refetch()
      toast.success("Normalization rules refreshed")
    } catch {
      toast.error("Failed to refresh normalization rules")
    }
  }

  const handleDeleteConfirm = () => {
    if (!deletingRule) return
    deleteRule(deletingRule.rule_code, {
      onSuccess: () => {
        toast.success(`Normalization rule "${deletingRule.display_label}" deleted successfully!`)
        setDeletingRule(null)
      },
      onError: (err: unknown) => {
        let errMsg = "Failed to delete normalization rule."
        const axiosErr = err as { response?: { data?: { message?: unknown } } }
        if (axiosErr.response?.data?.message) {
          errMsg = String(axiosErr.response.data.message)
        } else if (err instanceof Error) {
          errMsg = err.message
        }
        toast.error(errMsg)
      },
    })
  }

  const columns = useMemo<CustomColumnDef<NormalizationRule>[]>(
    () => [
      {
        accessorKey: "rule_code",
        header: "Code",
        width: 120,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-foreground">
            {row.original.rule_code}
          </span>
        ),
      },
      {
        accessorKey: "display_label",
        header: "Display Label",
        width: 140,
        cell: ({ row }) => (
          <span className="text-xs font-medium text-foreground">
            {row.original.display_label}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        width: 180,
        rowClassName: "hidden md:table-cell",
        cell: ({ row }) => (
          <span
            className="block max-w-[170px] truncate text-xs text-muted-foreground"
            title={row.original.description}
          >
            {row.original.description}
          </span>
        ),
      },
      {
        accessorKey: "rule_mode",
        header: "Mode",
        width: 100,
        rowClassName: "hidden lg:table-cell",
        cell: ({ row }) => (
          <span className="text-xs text-foreground font-mono uppercase">
            {row.original.rule_mode || "DECLARATIVE"}
          </span>
        ),
      },
      {
        accessorKey: "engine_type",
        header: "Engine Type",
        width: 110,
        rowClassName: "hidden lg:table-cell",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground font-mono">
            {row.original.engine_type}
          </span>
        ),
      },
      {
        accessorKey: "sort_sequence",
        header: "Sort Sequence",
        width: 80,
        rowClassName: "hidden lg:table-cell",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-foreground">
            {row.original.sort_sequence ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        width: 90,
        cell: ({ row }) => (
          <Badge
            variant={row.original.is_active ? "secondary" : "outline"}
            className={
              row.original.is_active
                ? "text-xxs px-2 py-0.5 border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold"
                : "text-xxs px-2 py-0.5 text-muted-foreground"
            }
          >
            {row.original.is_active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Action",
        width: 70,
        cell: ({ row }) => (
          <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 text-xs-fine">
                <DropdownMenuItem
                  onClick={() => navigate(`/platform-standard-content/normalization-rules/${row.original.rule_code}`)}
                  className="cursor-pointer gap-1.5"
                >
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setEditingRule(row.original)}
                  className="cursor-pointer gap-1.5"
                >
                  <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                  Edit Rule
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeletingRule(row.original)}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Rule
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [navigate]
  )

  const filteredData = useMemo(() => {
    const q = searchText.trim().toLowerCase()
    return rules.filter(
      (item) =>
        item.rule_code.toLowerCase().includes(q) ||
        item.display_label.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
    )
  }, [rules, searchText])

  return (
    <div className="flex w-full animate-in flex-col gap-6 pb-12 duration-200 fade-in">
      <PageHeader
        title="Normalization Rules"
        description="Configure standard normalization policies and cleanup patterns."
      >
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="w-full gap-1.5 px-3 sm:w-auto cursor-pointer"
        >
          <Plus className="size-4" /> Create Normalization Rule
        </Button>
      </PageHeader>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border-border p-0">
        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          <div className="flex flex-col gap-3 border-b bg-card p-3 lg:flex-row lg:items-center lg:justify-between">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Normalization Rules ({filteredData.length})
            </h3>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <SearchInput
                value={searchText}
                onChange={setSearchText}
                disabled={isLoading}
                placeholder="Search normalization rules..."
                className="w-full sm:w-72"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefetch}
                className="size-9 cursor-pointer"
                disabled={isFetching}
              >
                <RefreshCw
                  className={cn("size-4", isFetching && "animate-spin")}
                />
              </Button>
            </div>
          </div>

          <DataTable
            data={filteredData}
            columns={columns}
            isLoading={isLoading || isFetching}
            enablePagination
            pageSize={10}
            totalItems={filteredData.length}
            stickyHeader
            tableContainerClassName="border-0 rounded-none bg-transparent"
            onRowClick={(rule) => navigate(`/platform-standard-content/normalization-rules/${rule.rule_code}`)}
            emptyState={
              <NormalizationRulesEmptyState
                searchText={searchText}
                rulesLength={rules.length}
                onCreateClick={() => setCreateOpen(true)}
              />
            }
          />
        </CardContent>
      </Card>

      {/* Creation Dialog */}
      {createOpen && (
        <NormalizationRuleDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      )}

      {/* Edition Dialog */}
      {editingRule && (
        <NormalizationRuleDialog
          open={!!editingRule}
          onOpenChange={(open) => {
            if (!open) setEditingRule(null)
          }}
          normalizationRule={editingRule}
        />
      )}

      {/* Deletion confirmation dialog */}
      <DeleteNormalizationRuleDialog
        deletingRule={deletingRule}
        onClose={() => setDeletingRule(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  )
}

interface NormalizationRulesEmptyStateProps {
  searchText: string
  rulesLength: number
  onCreateClick: () => void
}

function NormalizationRulesEmptyState({
  searchText,
  rulesLength,
  onCreateClick,
}: NormalizationRulesEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-primary/5 p-4 rounded-full mb-3 text-primary/80 border border-primary/10">
        <ShieldCheck className="size-8 stroke-[1.5]" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">
        {searchText ? "No rules match search" : "No normalization rules"}
      </h3>
      <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
        {searchText
          ? "We couldn't find any normalization rules matching your query. Try adjusting your search term."
          : "Add your first declarative normalization rule to clean up or transform document fields."}
      </p>
      {!searchText && rulesLength === 0 && (
        <Button
          onClick={onCreateClick}
          className="mt-4 gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer"
        >
          <Plus className="size-3.5" /> Create Rule
        </Button>
      )}
    </div>
  )
}

interface DeleteNormalizationRuleDialogProps {
  deletingRule: NormalizationRule | null
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

function DeleteNormalizationRuleDialog({
  deletingRule,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteNormalizationRuleDialogProps) {
  if (!deletingRule) return null
  return (
    <Dialog open={!!deletingRule} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Normalization Rule</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the normalization rule <strong>{deletingRule.display_label || deletingRule.rule_code}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <p className="text-xs text-muted-foreground">
            Deleting this normalization rule is permanent and cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm cursor-pointer gap-1.5"
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="h-3 w-3 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
