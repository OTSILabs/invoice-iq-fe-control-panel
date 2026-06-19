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
import { useValidationRules, useDeleteValidationRuleMutation } from "@/api/hooks/validation-rules"
import type { ValidationRule } from "@/types"
import { ValidationRuleDialog } from "./modals/validation-rule-dialog"
import { cn } from "@/lib/utils"
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

export function ValidationRules() {
  const navigate = useNavigate()
  const { data: rules = [], isLoading, refetch, isFetching } = useValidationRules()
  const [searchText, setSearchText] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<ValidationRule | null>(null)
  const [deletingRule, setDeletingRule] = useState<ValidationRule | null>(null)

  const { mutate: deleteRule, isPending: isDeleting } = useDeleteValidationRuleMutation()

  const handleRefetch = async () => {
    try {
      await refetch()
      toast.success("Validation rules refreshed")
    } catch {
      toast.error("Failed to refresh validation rules")
    }
  }

  const handleDeleteConfirm = () => {
    if (!deletingRule) return
    deleteRule(deletingRule.rule_code, {
      onSuccess: () => {
        toast.success(`Validation rule "${deletingRule.display_label}" deleted successfully!`)
        setDeletingRule(null)
      },
      onError: (err: unknown) => {
        let errMsg = "Failed to delete validation rule."
        const axiosErr = err as { response?: { data?: { detail?: unknown; message?: unknown } } }
        if (axiosErr.response?.data?.detail) {
          errMsg = String(axiosErr.response.data.detail)
        } else if (axiosErr.response?.data?.message) {
          errMsg = String(axiosErr.response.data.message)
        } else if (err instanceof Error) {
          errMsg = err.message
        }
        toast.error(errMsg)
      },
    })
  }

  const columns = useMemo<CustomColumnDef<ValidationRule>[]>(
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
        id: "actions",
        header: "Action",
        width: 60,
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 cursor-pointer p-0"
                >
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-45">
                <DropdownMenuItem
                  className="cursor-pointer text-xs"
                  onClick={() => navigate(`/platform-standard-content/validation-rules/${row.original.rule_code}`)}
                >
                  <Eye className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-xs"
                  onClick={() => setEditingRule(row.original)}
                >
                  <Edit className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-xs text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={() => setDeletingRule(row.original)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete
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
    if (!q) return rules
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
        title="Validation Rules"
        description="Define and manage declarative rules for data validation."
      >
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="w-full gap-1.5 px-3 sm:w-auto"
        >
          <Plus className="size-4" /> Create Validation Rule
        </Button>
      </PageHeader>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border-border p-0">
        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          <div className="flex flex-col gap-3 border-b bg-card p-3 lg:flex-row lg:items-center lg:justify-between">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Validation Rules ({filteredData.length})
            </h3>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <SearchInput
                value={searchText}
                onChange={setSearchText}
                disabled={isLoading}
                placeholder="Search validation rules..."
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
            onRowClick={(rule) => navigate(`/platform-standard-content/validation-rules/${rule.rule_code}`)}
            emptyState={
              <ValidationRulesEmptyState
                searchText={searchText}
                rulesLength={rules.length}
                onCreateClick={() => setCreateOpen(true)}
              />
            }
          />
        </CardContent>
      </Card>

      {(createOpen || !!editingRule) && (
        <ValidationRuleDialog
          open={createOpen || !!editingRule}
          validationRule={editingRule}
          onOpenChange={(open) => {
            if (!open) {
              setCreateOpen(false)
              setEditingRule(null)
            }
          }}
        />
      )}

      <DeleteValidationRuleDialog
        deletingRule={deletingRule}
        onClose={() => setDeletingRule(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  )
}

interface ValidationRulesEmptyStateProps {
  searchText: string
  rulesLength: number
  onCreateClick: () => void
}

function ValidationRulesEmptyState({
  searchText,
  rulesLength,
  onCreateClick,
}: ValidationRulesEmptyStateProps) {
  return (
    <div className="flex animate-in flex-col items-center justify-center px-4 py-16 text-center duration-300 fade-in slide-in-from-bottom-2">
      <div className="mb-3 rounded-full border border-primary/10 bg-primary/5 p-4 text-primary/80">
        <ShieldCheck className="size-8 stroke-[1.5]" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">
        {searchText
          ? "No validation rules match filters"
          : "No standard validation rules"}
      </h3>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
        {searchText
          ? "We couldn't find any validation rules matching your search term. Try adjusting your search query."
          : "Create your first platform standard validation rule to manage formats."}
      </p>
      {!searchText && rulesLength === 0 && (
        <Button
          onClick={onCreateClick}
          className="mt-4 cursor-pointer gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold"
        >
          <Plus className="size-3.5" /> Create Validation Rule
        </Button>
      )}
    </div>
  )
}

interface DeleteValidationRuleDialogProps {
  deletingRule: ValidationRule | null
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

function DeleteValidationRuleDialog({
  deletingRule,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteValidationRuleDialogProps) {
  if (!deletingRule) return null
  return (
    <Dialog open={!!deletingRule} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Validation Rule</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the validation rule <strong>{deletingRule.rule_code}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <p className="text-xs text-muted-foreground">
            Deleting this validation rule is permanent and cannot be undone.
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
            className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm cursor-pointer"
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
