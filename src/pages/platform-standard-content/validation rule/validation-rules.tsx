import { useState, useMemo } from "react"
import { ShieldCheck, Plus, RefreshCw, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { SearchInput } from "@/components/search-input"
import { useValidationRules, useDeleteValidationRuleMutation } from "@/api/hooks/validation-rules"
import type { ValidationRule, DeleteValidationRuleDialogProps } from "@/types";
import { cn } from "@/lib/utils"
import { getValidationRuleColumns } from "@/columns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { EmptyState, FilterBar, PageShell } from "@/components/invoice-ui/design-system"

export function ValidationRules() {
  const navigate = useNavigate()
  const { data: rules = [], isLoading, refetch, isFetching } = useValidationRules()
  const [searchText, setSearchText] = useState("")
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

  const columns = useMemo(
    () => getValidationRuleColumns(navigate, (rule) => navigate(`/platform-standard-content/validation-rules/${rule.rule_code}/edit`), setDeletingRule),
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
    <PageShell>
      <PageHeader
        title="Validation Rules"
        description="Define and manage declarative rules for data validation."
      >
        <Button
          size="sm"
          onClick={() => navigate("/platform-standard-content/validation-rules/create")}
          className="w-full gap-1.5 px-3 sm:w-auto"
        >
          <Plus className="size-4" /> Create Validation Rule
        </Button>
      </PageHeader>

      <div className="table-container">
        <div className="flex min-h-0 flex-1 flex-col p-0">
          <FilterBar>
            <h3 className="text-xs font-semibold text-muted-foreground ">
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
          </FilterBar>

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
                onCreateClick={() => navigate("/platform-standard-content/validation-rules/create")}
              />
            }
          />
        </div>
      </div>

      <DeleteValidationRuleDialog
        deletingRule={deletingRule}
        onClose={() => setDeletingRule(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </PageShell>
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
    <EmptyState
      icon={ShieldCheck}
      title={searchText ? "No validation rules match filters" : "No standard validation rules"}
      description={
        searchText
          ? "We couldn't find any validation rules matching your search term. Try adjusting your search query."
          : "Create your first platform standard validation rule to manage formats."
      }
      className="min-h-0 border-0 bg-transparent py-10"
      actions={!searchText && rulesLength === 0 ? (
        <Button
          onClick={onCreateClick}
          className="cursor-pointer gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold"
        >
          <Plus className="size-3.5" /> Create Validation Rule
        </Button>
      ) : undefined}
    />
  )
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
        <DialogFooter className="dialog-form-footer">
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
            variant="destructive"
            className="cursor-pointer"
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
