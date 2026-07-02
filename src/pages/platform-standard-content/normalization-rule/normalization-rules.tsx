import { PageMetadata } from "@/components/layout/PageMetadata"
import { useState, useMemo } from "react"
import { ShieldCheck, Plus, RefreshCw, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { SearchInput } from "@/components/search-input"
import { useNormalizationRules, useDeleteNormalizationRuleMutation } from "@/api/hooks/normalization-rules"
import type { NormalizationRule, DeleteNormalizationRuleDialogProps } from "@/types";
import { cn } from "@/lib/utils"
import { getNormalizationRuleColumns } from "@/columns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { EmptyState, FilterBar, PageShell } from "@/components/invoice-ui/design-system"

export function NormalizationRules() {
  const navigate = useNavigate()
  const { data: rules = [], isLoading, refetch, isFetching } = useNormalizationRules()
  const [searchText, setSearchText] = useState("")
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
    () => getNormalizationRuleColumns(navigate, (rule) => navigate(`/platform-standard-content/normalization-rules/${rule.rule_code}/edit`), setDeletingRule),
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
    <PageShell>
      <PageMetadata title="Normalization Rules" description="Configure formatting and normalization transformations for extracted data." keywords="normalization rules, regex formatting, data cleaning" />
      <PageHeader
        title="Normalization Rules"
        description="Configure standard normalization policies and cleanup patterns."
      >
        <Button
          size="sm"
          onClick={() => navigate("/platform-standard-content/normalization-rules/create")}
          className="w-full gap-1.5 px-3 sm:w-auto cursor-pointer"
          disabled={isFetching}
        >
          <Plus className="size-4" /> Create Normalization Rule
        </Button>
      </PageHeader>

      <div className="table-container">
        <div className="flex min-h-0 flex-1 flex-col p-0">
          <FilterBar>
            <h3 className="text-xs font-semibold text-muted-foreground ">
              Normalization Rules ({filteredData.length})
            </h3>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <SearchInput
                value={searchText}
                onChange={setSearchText}
                disabled={isFetching}
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
            onRowClick={(rule) => navigate(`/platform-standard-content/normalization-rules/${rule.rule_code}`)}
            emptyState={
              <NormalizationRulesEmptyState
                searchText={searchText}
                rulesLength={rules.length}
                onCreateClick={() => navigate("/platform-standard-content/normalization-rules/create")}
                disabled={isFetching}
              />
            }
          />
        </div>
      </div>

      {/* Deletion confirmation dialog */}
      <DeleteNormalizationRuleDialog
        deletingRule={deletingRule}
        onClose={() => setDeletingRule(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </PageShell>
  )
}

interface NormalizationRulesEmptyStateProps {
  searchText: string
  rulesLength: number
  onCreateClick: () => void
  disabled?: boolean
}

function NormalizationRulesEmptyState({
  searchText,
  rulesLength,
  onCreateClick,
  disabled,
}: NormalizationRulesEmptyStateProps) {
  return (
    <EmptyState
      icon={ShieldCheck}
      title={searchText ? "No rules match search" : "No normalization rules"}
      description={
        searchText
          ? "We couldn't find any normalization rules matching your query. Try adjusting your search term."
          : "Add your first declarative normalization rule to clean up or transform document fields."
      }
      className="min-h-0 border-0 bg-transparent py-10"
      actions={!searchText && rulesLength === 0 ? (
        <Button
          onClick={onCreateClick}
          className="cursor-pointer gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold"
          disabled={disabled}
        >
          <Plus className="size-3.5" /> Create Rule
        </Button>
      ) : undefined}
    />
  )
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
            className="cursor-pointer gap-1.5"
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