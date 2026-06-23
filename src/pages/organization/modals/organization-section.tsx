import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Field, FieldLabel} from "@/components/ui/field";
import {InputField} from "../../../components/ui/input-field";
import {Plus} from "lucide-react";
import {useFormContext} from "react-hook-form";
import type {OrganizationSectionProps} from "@/types";



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
        <h3 className="mb-1 text-base font-bold text-foreground">
          1. Organization Details
        </h3>
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
                <option value="" disabled>
                  Loading organizations…
                </option>
              ) : organizations.length === 0 ? (
                <option value="" disabled>
                  No organizations found
                </option>
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
              className="text-primary hover:text-primary/80 mt-1"
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
              <span className="text-destructive ml-0.5">*</span>
            </FieldLabel>
            <div className="flex items-center gap-2">
              <Input
                id="orgName"
                placeholder="e.g. Acme Corp"
                className="h-9 flex-1 rounded-lg border border-input bg-inherit px-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                {...register("orgName")}
              />
              {organizations.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 shrink-0 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
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

        {/* {existingOrganization && (
          <p className="text-[11px] text-muted-foreground">
            Defaults to the pre-selected organization. You can select another if needed.
          </p>
        )} */}
      </div>
    </div>
  )
}
