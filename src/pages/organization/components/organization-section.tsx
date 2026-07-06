import { Plus } from "lucide-react"
import { useFormContext } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputField } from "@/components/ui/input-field"
import type { OrganizationSectionProps } from "@/types"

export function OrganizationSection({
  existingOrganization,
  organizations,
  isOrgsLoading,
  isCreatingOrg,
  selectedOrgId,
  handleToggleCreatingOrg,
  handleOrgChange,
}: OrganizationSectionProps) {
  const { register, formState: { errors } } = useFormContext()

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-1 text-base font-bold text-foreground">1. Organization Details</h3>
        <p className="text-xs text-muted-foreground">
          {existingOrganization
            ? "Adding tenant to pre-selected organization."
            : "Choose an existing organization or set up a new one."}
        </p>
      </div>

      <div className="space-y-1">
        {!isCreatingOrg ? (
          <>
            <InputField
              id="existingOrgSelect"
              label="Organization"
              required
              type="select"
              value={selectedOrgId}
              onChange={(e) => {
                if (e.target.value === "__create__") {
                  handleToggleCreatingOrg(true)
                } else {
                  handleOrgChange(e as React.ChangeEvent<HTMLSelectElement>)
                }
              }}
            >
              <option value="" disabled>Select Organization</option>
              {isOrgsLoading ? (
                <option value="" disabled>Loading organizations...</option>
              ) : organizations.length === 0 ? (
                <option value="" disabled>No organizations found</option>
              ) : (
                organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))
              )}
            </InputField>
            <Button
              type="button"
              variant="link"
              size="xs"
              className="mt-1 text-primary hover:text-primary/80"
              onClick={() => handleToggleCreatingOrg(true)}
            >
              <Plus className="size-3" />
              Create organization
            </Button>
          </>
        ) : (
          <Field>
            <FieldLabel htmlFor="orgName" className="text-sm font-medium text-foreground">
              Organization name
              <span className="ml-0.5 text-destructive">*</span>
            </FieldLabel>
            <div className="flex items-center gap-2">
              <Input
                id="orgName"
                placeholder="e.g. Acme Corp"
                className="flex-1"
                {...register("orgName")}
              />
              {organizations.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0  text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => handleToggleCreatingOrg(false)}
                >
                  Select existing
                </Button>
              )}
            </div>
            {errors.orgName?.message && (
              <span className="px-1 text-[11px] font-medium text-destructive">
                {String(errors.orgName.message)}
              </span>
            )}
          </Field>
        )}
      </div>
    </div>
  )
}
