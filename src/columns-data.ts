// @ts-nocheck
/* eslint-disable react-refresh/only-export-components, react-doctor/only-export-components */
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import { MaskedValue } from "@/components/ui/copyable-field";
import { EditableValueCell } from "@/pages/organization/components/editable-value-cell";
import { EditableValueCell as ProfileEditableValueCell } from "@/pages/organization/components/profile-editable-value-cell";
import { TenantActionsDropdown } from "@/pages/organization/components/tenant-actions-dropdown";
import { SemanticBadge } from "@/components/invoice-ui/design-system";
import { MoreVertical, Eye, Edit, Edit2, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/invoice-ui/status-badge";
import { ActiveStatusBadge } from "@/components/invoice-ui/active-status-badge";
import { RoleBadge } from "@/components/invoice-ui/role-badge";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export { StatusBadge } from "@/components/invoice-ui/status-badge";
export { ActiveStatusBadge } from "@/components/invoice-ui/active-status-badge";
export { RoleBadge } from "@/components/invoice-ui/role-badge";

// User role parsing utility
export const getRolesList = u => {
  if (!u) return [];
  const raw = Array.isArray(u.roles) ? u.roles : Array.isArray(u.role_names) ? u.role_names : [u.role, u.role_name];
  return raw.reduce((acc, r) => {
    if (r) {
      const name = typeof r === "string" ? r : r?.name || "";
      if (name) acc.push(name);
    }
    return acc;
  }, []);
};

// 1. Subscription Plans Columns
export const planColumns = [{
  accessorKey: "plan_type",
  header: "Plan Type",
  width: 140,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs font-semibold text-foreground",
    children: row.original.plan_type || "—"
  })
}, {
  accessorKey: "price_per_invoice_currency",
  header: "Currency",
  width: 100,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs font-semibold text-muted-foreground",
    children: row.original.price_per_invoice_currency || "—"
  })
}, {
  accessorKey: "price_per_invoice_amount",
  header: "Price",
  width: 100,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs font-medium text-foreground",
    children: row.original.price_per_invoice_amount ?? "—"
  })
}, {
  accessorKey: "plan_interval",
  header: "Interval",
  width: 120,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs text-muted-foreground",
    children: row.original.plan_interval || "—"
  })
}, {
  accessorKey: "is_active",
  header: "Status",
  width: 100,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx(ActiveStatusBadge, {
    active: row.original.is_active
  })
}, {
  accessorKey: "description",
  header: "Description",
  width: 120,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "block truncate text-xs text-muted-foreground",
    children: row.original.description || "—"
  })
}, {
  accessorKey: "created_at",
  header: "Created At",
  width: 140,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs text-muted-foreground",
    children: row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "N/A"
  })
}, {
  id: "actions",
  header: "Actions",
  width: 80,
  cell: ({
    row
  }) => {
    return /*#__PURE__*/_jsx("div", {
      className: "flex items-center",
      onClick: e => e.stopPropagation(),
      children: /*#__PURE__*/_jsxs(DropdownMenu, {
        children: [/*#__PURE__*/_jsx(DropdownMenuTrigger, {
          asChild: true,
          children: /*#__PURE__*/_jsx(Button, {
            variant: "ghost",
            size: "sm",
            className: "h-8 w-8  p-0",
            children: /*#__PURE__*/_jsx(MoreVertical, {
              className: "h-4 w-4 text-muted-foreground"
            })
          })
        }), /*#__PURE__*/_jsxs(DropdownMenuContent, {
          align: "end",
          className: "w-45",
          children: [/*#__PURE__*/_jsx(DropdownMenuItem, {
            asChild: true,
            className: "gap-1.5 text-xs cursor-pointer",
            children: /*#__PURE__*/_jsxs(Link, {
              to: `/plan/${row.original.id}`,
              children: [/*#__PURE__*/_jsx(Eye, {
                className: "h-3.5 w-3.5 text-muted-foreground"
              }), "View Details"]
            })
          }), /*#__PURE__*/_jsxs(DropdownMenuItem, {
            disabled: true,
            className: "cursor-not-allowed gap-1.5 text-xs opacity-50",
            children: [/*#__PURE__*/_jsx(Edit, {
              className: "h-3.5 w-3.5 text-muted-foreground"
            }), "Edit"]
          }), /*#__PURE__*/_jsxs(DropdownMenuItem, {
            disabled: true,
            className: "cursor-not-allowed gap-1.5 text-xs text-red-600 opacity-50 focus:text-red-700",
            children: [/*#__PURE__*/_jsx(Trash2, {
              className: "h-3.5 w-3.5"
            }), "Delete"]
          })]
        })]
      })
    });
  }
}];

// 2. Tenant list table columns
export const getTenantColumns = (orgId, setTenantAction) => [{
  accessorKey: "slug",
  header: "Slug",
  width: "15%",
  minWidth: 100,
  cell: ({
    row
  }) => {
    const slug = row.original.slug || "—";
    return /*#__PURE__*/_jsxs("div", {
      className: "flex items-center gap-2.5 py-0.5",
      children: [/*#__PURE__*/_jsx("div", {
        className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-[10px] leading-none font-semibold text-primary",
        children: getInitials(slug)
      }), /*#__PURE__*/_jsx("span", {
        className: "truncate text-xs font-semibold text-foreground",
        children: slug
      })]
    });
  }
}, {
  accessorKey: "tenant_role",
  header: "Role",
  width: "15%",
  minWidth: 80,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs text-muted-foreground capitalize",
    children: String(row.original.tenant_role || "").replace(/_/g, " ") || "—"
  })
}, {
  accessorKey: "tenant_admin_full_name",
  header: "Admin",
  width: "20%",
  minWidth: 100,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "truncate text-xs font-medium text-foreground",
    children: row.original.tenant_admin_full_name || "—"
  })
}, {
  accessorKey: "tenant_admin_email",
  header: "Email",
  width: "25%",
  minWidth: 120,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "truncate text-xs text-muted-foreground",
    children: row.original.tenant_admin_email || "—"
  })
}, {
  accessorKey: "access_status",
  header: "Status",
  width: "15%",
  minWidth: 80,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx(StatusBadge, {
    status: String(row.original.access_status || "inactive")
  })
}, {
  id: "actions",
  header: "Actions",
  width: "10%",
  minWidth: 80,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("div", {
    className: "flex justify-start",
    onClick: e => e.stopPropagation(),
    children: /*#__PURE__*/_jsx(TenantActionsDropdown, {
      tenant: row.original,
      orgId: row.original.organisation_id || orgId,
      setTenantAction: setTenantAction
    })
  })
}];

// 3. Configurations table columns
export const getConfigurationsColumns = (isSaving, apiKeysMetadata, handleValueChange) => [{
  id: "label",
  header: "Label",
  width: 150,
  cell: ({
    row
  }) => {
    const key = row.original.key;
    const metadata = apiKeysMetadata[key] || {
      defaultValue: "",
      isBoolean: false,
      isRequired: false,
      label: key,
      description: ""
    };
    return /*#__PURE__*/_jsx("span", {
      className: "text-xs text-foreground",
      children: metadata.label
    });
  }
}, {
  accessorKey: "key",
  header: "Key",
  width: 150,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs text-foreground",
    children: row.original.key
  })
}, {
  accessorKey: "value",
  header: "Value",
  width: 200,
  cell: ({
    row
  }) => {
    const isNewRow = row.original.isNewRow;
    const key = row.original.key;
    const metadata = apiKeysMetadata[key] || {
      defaultValue: "",
      isBoolean: false,
      isRequired: false,
      label: key,
      description: ""
    };
    if (isNewRow) {
      return /*#__PURE__*/_jsx(EditableValueCell, {
        configKey: key,
        initialValue: String(row.original.value),
        isSaving: isSaving,
        isBoolean: metadata.isBoolean,
        referenceKey: metadata.referenceKey,
        onValueChange: handleValueChange
      }, `${key}-${row.original.dbValue || ""}`);
    }
    if (metadata.referenceKey && row.original.value) {
      return /*#__PURE__*/_jsx("div", {
        className: "flex items-center",
        children: /*#__PURE__*/_jsx(Link, {
          to: `/platform-standard-content/reference-lists/${metadata.referenceKey}/${row.original.value}`,
          className: " rounded border border-border bg-muted/50 px-2 py-0.5 text-left text-xs font-semibold text-foreground transition-colors hover:bg-muted hover:underline",
          title: "Click to view reference item details",
          children: String(row.original.value)
        })
      });
    }
    return /*#__PURE__*/_jsx(MaskedValue, {
      value: String(row.original.value)
    });
  }
}];

// 4. Profile table columns
export const getProfileColumns = (isSaving, apiKeysMetadata, handleValueChange) => [{
  accessorKey: "key",
  header: "Key",
  width: 150,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs text-foreground",
    children: row.original.key
  })
}, {
  id: "label",
  header: "Label",
  width: 150,
  cell: ({
    row
  }) => {
    const key = row.original.key;
    const metadata = apiKeysMetadata[key] || {
      defaultValue: "",
      isBoolean: false,
      isRequired: false,
      label: key,
      description: ""
    };
    return /*#__PURE__*/_jsx("span", {
      className: "text-xs text-foreground",
      children: metadata.label
    });
  }
}, {
  accessorKey: "value",
  header: "Value",
  width: 200,
  cell: ({
    row
  }) => {
    const key = row.original.key;
    const metadata = apiKeysMetadata[key] || {
      defaultValue: "",
      isBoolean: false,
      isRequired: false,
      label: key,
      description: ""
    };
    return /*#__PURE__*/_jsx(ProfileEditableValueCell, {
      configKey: key,
      initialValue: String(row.original.value),
      isSaving: isSaving,
      isBoolean: metadata.isBoolean,
      referenceKey: metadata.referenceKey,
      onValueChange: handleValueChange
    }, `${key}-${row.original.dbValue || ""}`);
  }
}];

// 5. Data Types columns
export const getDataTypeColumns = (navigate, setEditingDataType) => [{
  accessorKey: "data_type_code",
  header: "Code",
  width: 130,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs font-semibold text-foreground",
    children: row.original.data_type_code || "—"
  })
}, {
  accessorKey: "display_label",
  header: "Display Label",
  width: 130,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs font-medium text-foreground",
    children: row.original.display_label || "—"
  })
}, {
  accessorKey: "description",
  header: "Description",
  width: 180,
  rowClassName: "hidden md:table-cell",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "block max-w-[170px] truncate text-xs text-muted-foreground",
    title: row.original.description || "—",
    children: row.original.description || "—"
  })
}, {
  accessorKey: "sample_value",
  header: "Sample Value",
  width: 120,
  rowClassName: "hidden lg:table-cell",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "block max-w-[110px] truncate text-xs text-muted-foreground",
    children: row.original.sample_value || "—"
  })
}, {
  accessorKey: "sort_sequence",
  header: "Sort Sequence",
  width: 60,
  rowClassName: "hidden lg:table-cell",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs font-medium text-foreground",
    children: row.original.sort_sequence ?? "—"
  })
}, {
  accessorKey: "created_at",
  header: "Created At",
  width: 100,
  rowClassName: "hidden md:table-cell",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs text-muted-foreground",
    children: row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "—"
  })
}, {
  id: "actions",
  header: "Action",
  width: 60,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("div", {
    onClick: e => e.stopPropagation(),
    children: /*#__PURE__*/_jsxs(DropdownMenu, {
      children: [/*#__PURE__*/_jsx(DropdownMenuTrigger, {
        asChild: true,
        children: /*#__PURE__*/_jsx(Button, {
          variant: "ghost",
          size: "sm",
          className: "h-8 w-8  p-0",
          children: /*#__PURE__*/_jsx(MoreVertical, {
            className: "h-4 w-4 text-muted-foreground"
          })
        })
      }), /*#__PURE__*/_jsxs(DropdownMenuContent, {
        align: "end",
        className: "w-45",
        children: [/*#__PURE__*/_jsxs(DropdownMenuItem, {
          className: " text-xs",
          onClick: () => navigate(`/platform-standard-content/data-types/${row.original.data_type_code}`),
          children: [/*#__PURE__*/_jsx(Eye, {
            className: "mr-2 h-3.5 w-3.5 text-muted-foreground"
          }), "View Details"]
        }), /*#__PURE__*/_jsxs(DropdownMenuItem, {
          className: " text-xs",
          onClick: () => setEditingDataType(row.original),
          children: [/*#__PURE__*/_jsx(Edit, {
            className: "mr-2 h-3.5 w-3.5 text-muted-foreground"
          }), "Edit"]
        })]
      })]
    })
  })
}];

// 7. Extraction Fields table columns
export const getFieldsTableColumns = (onEdit, onView) => [{
  accessorKey: "field_id",
  header: "Field ID",
  width: "20%",
  minWidth: "120px",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "block truncate text-xs font-semibold text-foreground",
    children: row.original.field_id || "—"
  })
}, {
  accessorKey: "field_label",
  header: "Label",
  width: "20%",
  minWidth: "130px",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs font-medium text-foreground",
    children: row.original.field_label || "—"
  })
}, {
  accessorKey: "data_type_code",
  header: "Type",
  width: "120px",
  minWidth: "100px",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx(SemanticBadge, {
    tone: "neutral",
    className: "",
    children: row.original.data_type_code || "—"
  })
}, {
  accessorKey: "field_category_code",
  header: "Category",
  width: "150px",
  minWidth: "120px",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "block truncate text-xs text-muted-foreground",
    children: row.original.field_category_code || "—"
  })
}, {
  accessorKey: "header_item",
  header: "Scope",
  width: "100px",
  minWidth: "80px",
  cell: ({
    row
  }) => {
    const isHeader = row.original.header_item === "header";
    return /*#__PURE__*/_jsx(SemanticBadge, {
      tone: isHeader ? "accent" : "info",
      className: "capitalize",
      children: row.original.header_item || "—"
    });
  }
}, {
  accessorKey: "allowed_value_mode",
  header: "Value Mode",
  width: "130px",
  minWidth: "110px",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs text-muted-foreground capitalize",
    children: (row.original.allowed_value_mode || "—").replace("_", " ")
  })
}, {
  id: "actions",
  header: "Actions",
  width: "80px",
  minWidth: "80px",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("div", {
    className: "flex items-center",
    onClick: e => e.stopPropagation(),
    children: /*#__PURE__*/_jsx("div", {
      onClick: e => e.stopPropagation(),
      children: /*#__PURE__*/_jsxs(DropdownMenu, {
        children: [/*#__PURE__*/_jsx(DropdownMenuTrigger, {
          asChild: true,
          children: /*#__PURE__*/_jsx(Button, {
            variant: "ghost",
            size: "sm",
            className: "h-8 w-8  p-0",
            children: /*#__PURE__*/_jsx(MoreVertical, {
              className: "h-4 w-4 text-muted-foreground"
            })
          })
        }), /*#__PURE__*/_jsxs(DropdownMenuContent, {
          align: "end",
          className: "w-45",
          children: [/*#__PURE__*/_jsxs(DropdownMenuItem, {
            className: " text-xs",
            onClick: () => onView && onView(row.original),
            children: [/*#__PURE__*/_jsx(Eye, {
              className: "mr-2 h-3.5 w-3.5 text-muted-foreground"
            }), "View"]
          }), /*#__PURE__*/_jsxs(DropdownMenuItem, {
            className: " text-xs",
            onClick: () => onEdit(row.original),
            children: [/*#__PURE__*/_jsx(Edit, {
              className: "mr-2 h-3.5 w-3.5 text-muted-foreground"
            }), "Edit"]
          })]
        })]
      })
    })
  })
}];

// 8. Field Categories table columns
export const getFieldCategoriesColumns = (navigate, handleOpenEdit) => [{
  accessorKey: "field_category_code",
  header: "Category Code",
  width: "25%",
  minWidth: "150px",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs font-semibold text-slate-700",
    children: row.original.field_category_code || "—"
  })
}, {
  accessorKey: "ui_label",
  header: "UI Label",
  width: "25%",
  minWidth: "150px",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs font-medium text-foreground",
    children: row.original.ui_label || "—"
  })
}, {
  accessorKey: "description",
  header: "Description",
  width: "50%",
  minWidth: "250px",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "block max-w-[450px] truncate text-xs text-muted-foreground",
    title: row.original.description || "—",
    children: row.original.description || "—"
  })
}, {
  accessorKey: "example_fields",
  header: "Fields",
  width: "100px",
  minWidth: "90px",
  maxWidth: "110px",
  cell: ({
    row
  }) => {
    const count = row.original.example_fields?.length || 0;
    return /*#__PURE__*/_jsxs(SemanticBadge, {
      tone: "accent",
      children: [count, " ", count === 1 ? "Field" : "Fields"]
    });
  }
}, {
  accessorKey: "sort_sequence",
  header: "Sort",
  width: "80px",
  minWidth: "70px",
  maxWidth: "80px",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs font-semibold text-muted-foreground",
    children: row.original.sort_sequence ?? "—"
  })
}, {
  id: "actions",
  header: "Actions",
  width: "80px",
  minWidth: "80px",
  maxWidth: "80px",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("div", {
    className: "flex items-center",
    onClick: e => e.stopPropagation(),
    children: /*#__PURE__*/_jsxs(DropdownMenu, {
      children: [/*#__PURE__*/_jsx(DropdownMenuTrigger, {
        asChild: true,
        children: /*#__PURE__*/_jsx(Button, {
          variant: "ghost",
          size: "sm",
          className: "h-8 w-8  p-0",
          children: /*#__PURE__*/_jsx(MoreVertical, {
            className: "h-4 w-4 text-muted-foreground"
          })
        })
      }), /*#__PURE__*/_jsxs(DropdownMenuContent, {
        align: "end",
        className: "w-45",
        children: [/*#__PURE__*/_jsxs(DropdownMenuItem, {
          className: " text-xs",
          onClick: () => navigate(`/platform-standard-content/field-categories/${row.original.field_category_code}`),
          children: [/*#__PURE__*/_jsx(Eye, {
            className: "mr-2 h-3.5 w-3.5 text-muted-foreground"
          }), "View Details"]
        }), /*#__PURE__*/_jsxs(DropdownMenuItem, {
          className: " text-xs",
          onClick: () => handleOpenEdit(row.original),
          children: [/*#__PURE__*/_jsx(Edit2, {
            className: "mr-2 h-3.5 w-3.5 text-muted-foreground"
          }), "Edit"]
        })]
      })]
    })
  })
}];

// 9. Normalization Rules table columns
export const getNormalizationRuleColumns = (navigate, setEditingRule, setDeletingRule) => [{
  accessorKey: "rule_code",
  header: "Code",
  width: 120,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs font-semibold text-foreground",
    children: row.original.rule_code || "—"
  })
}, {
  accessorKey: "display_label",
  header: "Display Label",
  width: 140,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs font-medium text-foreground",
    children: row.original.display_label || "—"
  })
}, {
  accessorKey: "description",
  header: "Description",
  width: 180,
  rowClassName: "hidden md:table-cell",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "block max-w-[170px] truncate text-xs text-muted-foreground",
    title: row.original.description || "—",
    children: row.original.description || "—"
  })
}, {
  accessorKey: "rule_mode",
  header: "Mode",
  width: 100,
  rowClassName: "hidden lg:table-cell",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs text-foreground",
    children: row.original.rule_mode || "DECLARATIVE"
  })
}, {
  accessorKey: "engine_type",
  header: "Engine Type",
  width: 110,
  rowClassName: "hidden lg:table-cell",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs text-muted-foreground",
    children: row.original.engine_type || "-"
  })
}, {
  accessorKey: "sort_sequence",
  header: "Sort Sequence",
  width: 80,
  rowClassName: "hidden lg:table-cell",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs font-medium text-foreground",
    children: row.original.sort_sequence ?? "—"
  })
}, {
  accessorKey: "status",
  header: "Status",
  width: 90,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx(ActiveStatusBadge, {
    active: row.original.is_active,
    className: "text-xxs px-2 py-0.5 font-semibold"
  })
}, {
  id: "actions",
  header: "Action",
  width: 70,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("div", {
    className: "flex items-center",
    onClick: e => e.stopPropagation(),
    children: /*#__PURE__*/_jsxs(DropdownMenu, {
      children: [/*#__PURE__*/_jsx(DropdownMenuTrigger, {
        asChild: true,
        children: /*#__PURE__*/_jsx(Button, {
          variant: "ghost",
          size: "sm",
          className: "h-8 w-8  p-0",
          children: /*#__PURE__*/_jsx(MoreVertical, {
            className: "h-4 w-4 text-muted-foreground"
          })
        })
      }), /*#__PURE__*/_jsxs(DropdownMenuContent, {
        align: "end",
        className: "text-xs-fine w-45",
        children: [/*#__PURE__*/_jsxs(DropdownMenuItem, {
          onClick: () => navigate(`/platform-standard-content/normalization-rules/${row.original.rule_code}`),
          className: " gap-1.5",
          children: [/*#__PURE__*/_jsx(Eye, {
            className: "h-3.5 w-3.5 text-muted-foreground"
          }), "View Details"]
        }), /*#__PURE__*/_jsxs(DropdownMenuItem, {
          onClick: () => setEditingRule(row.original),
          className: " gap-1.5",
          children: [/*#__PURE__*/_jsx(Edit, {
            className: "h-3.5 w-3.5 text-muted-foreground"
          }), "Edit"]
        }), /*#__PURE__*/_jsxs(DropdownMenuItem, {
          onClick: () => setDeletingRule(row.original),
          className: " gap-1.5 text-red-600 focus:bg-red-50 focus:text-red-600",
          children: [/*#__PURE__*/_jsx(Trash2, {
            className: "h-3.5 w-3.5"
          }), "Delete"]
        })]
      })]
    })
  })
}];

// 10. Validation Rules table columns
export const getValidationRuleColumns = (navigate, setEditingRule, setDeletingRule) => [{
  accessorKey: "rule_code",
  header: "Code",
  width: 120,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs font-semibold text-foreground",
    children: row.original.rule_code
  })
}, {
  accessorKey: "display_label",
  header: "Display Label",
  width: 140,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs font-medium text-foreground",
    children: row.original.display_label
  })
}, {
  accessorKey: "description",
  header: "Description",
  width: 180,
  rowClassName: "hidden md:table-cell",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "block max-w-[170px] truncate text-xs text-muted-foreground",
    title: row.original.description || "—",
    children: row.original.description || "—"
  })
}, {
  accessorKey: "rule_mode",
  header: "Mode",
  width: 100,
  rowClassName: "hidden lg:table-cell",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs text-foreground",
    children: row.original.rule_mode || "DECLARATIVE"
  })
}, {
  accessorKey: "engine_type",
  header: "Engine Type",
  width: 110,
  rowClassName: "hidden lg:table-cell",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs text-muted-foreground",
    children: row.original.engine_type || "—"
  })
}, {
  accessorKey: "sort_sequence",
  header: "Sort Sequence",
  width: 80,
  rowClassName: "hidden lg:table-cell",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs font-medium text-foreground",
    children: row.original.sort_sequence ?? "—"
  })
}, {
  accessorKey: "status",
  header: "Status",
  width: 90,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx(ActiveStatusBadge, {
    active: row.original.is_active,
    className: "text-xxs px-2 py-0.5 font-semibold"
  })
}, {
  id: "actions",
  header: "Action",
  width: 70,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("div", {
    className: "flex items-center",
    onClick: e => e.stopPropagation(),
    children: /*#__PURE__*/_jsxs(DropdownMenu, {
      children: [/*#__PURE__*/_jsx(DropdownMenuTrigger, {
        asChild: true,
        children: /*#__PURE__*/_jsx(Button, {
          variant: "ghost",
          size: "sm",
          className: "h-8 w-8  p-0",
          children: /*#__PURE__*/_jsx(MoreVertical, {
            className: "h-4 w-4 text-muted-foreground"
          })
        })
      }), /*#__PURE__*/_jsxs(DropdownMenuContent, {
        align: "end",
        className: "text-xs-fine w-45",
        children: [/*#__PURE__*/_jsxs(DropdownMenuItem, {
          onClick: () => navigate(`/platform-standard-content/validation-rules/${row.original.rule_code}`),
          className: " gap-1.5",
          children: [/*#__PURE__*/_jsx(Eye, {
            className: "h-3.5 w-3.5 text-muted-foreground"
          }), "View Details"]
        }), /*#__PURE__*/_jsxs(DropdownMenuItem, {
          onClick: () => setEditingRule(row.original),
          className: " gap-1.5",
          children: [/*#__PURE__*/_jsx(Edit, {
            className: "h-3.5 w-3.5 text-muted-foreground"
          }), "Edit"]
        }), /*#__PURE__*/_jsxs(DropdownMenuItem, {
          onClick: () => setDeletingRule(row.original),
          className: " gap-1.5 text-red-600 focus:bg-red-50 focus:text-red-600",
          children: [/*#__PURE__*/_jsx(Trash2, {
            className: "h-3.5 w-3.5"
          }), "Delete"]
        })]
      })]
    })
  })
}];

// 11. Reference Lists table columns
export const getReferenceListsColumns = (navigate, handleOpenEdit) => [{
  accessorKey: "registry_key",
  header: "Registry Key",
  width: 220,
  minWidth: 150,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "block truncate text-xs font-semibold text-foreground",
    children: row.original.registry_key || "—"
  })
}, {
  accessorKey: "display_label",
  header: "Display Label",
  width: 220,
  minWidth: 150,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs font-medium text-foreground",
    children: row.original.display_label || "—"
  })
}, {
  accessorKey: "source_type",
  header: "Source",
  width: 120,
  minWidth: 100,
  cell: ({
    row
  }) => {
    const type = row.original.source_type || "custom";
    const tone = type === "system" ? "info" : type === "standard" ? "accent" : "neutral";
    return /*#__PURE__*/_jsx(SemanticBadge, {
      tone: tone,
      className: "capitalize",
      children: type
    });
  }
}, {
  accessorKey: "description",
  header: "Description",
  width: 220,
  minWidth: 150,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "block max-w-[450px] truncate text-xs text-muted-foreground",
    title: row.original.description || "",
    children: row.original.description || "—"
  })
}, {
  accessorKey: "sort_sequence",
  header: "Sort",
  width: 100,
  minWidth: 80,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs font-semibold text-muted-foreground",
    children: row.original.sort_sequence ?? "—"
  })
}, {
  id: "actions",
  header: "Actions",
  width: 80,
  minWidth: 80,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("div", {
    className: "flex items-center",
    onClick: e => e.stopPropagation(),
    children: /*#__PURE__*/_jsxs(DropdownMenu, {
      children: [/*#__PURE__*/_jsx(DropdownMenuTrigger, {
        asChild: true,
        children: /*#__PURE__*/_jsx(Button, {
          variant: "ghost",
          size: "sm",
          className: "h-8 w-8  p-0",
          children: /*#__PURE__*/_jsx(MoreVertical, {
            className: "h-4 w-4 text-muted-foreground"
          })
        })
      }), /*#__PURE__*/_jsxs(DropdownMenuContent, {
        align: "end",
        className: "w-45",
        children: [/*#__PURE__*/_jsxs(DropdownMenuItem, {
          className: " text-xs",
          onClick: () => navigate(`/platform-standard-content/reference-lists/${row.original.registry_key}`),
          children: [/*#__PURE__*/_jsx(Eye, {
            className: "mr-2 h-3.5 w-3.5 text-muted-foreground"
          }), "View Details"]
        }), /*#__PURE__*/_jsxs(DropdownMenuItem, {
          className: " text-xs",
          onClick: () => handleOpenEdit(row.original),
          children: [/*#__PURE__*/_jsx(Edit2, {
            className: "mr-2 h-3.5 w-3.5 text-muted-foreground"
          }), "Edit"]
        })]
      })]
    })
  })
}];

// 12. Reference List Details table columns
export const getReferenceListDetailsColumns = (navigate, registryKey, handleOpenEdit) => [{
  accessorKey: "value_code",
  header: "Value Code",
  width: 220,
  minWidth: 130,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "block truncate text-xs font-semibold text-foreground",
    children: row.original.value_code || "—"
  })
}, {
  accessorKey: "value_label",
  header: "Display Label",
  width: 220,
  minWidth: 150,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs font-medium text-foreground",
    children: row.original.value_label || "—"
  })
}, {
  accessorKey: "description",
  header: "Description",
  width: 320,
  minWidth: 200,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "block max-w-[350px] truncate text-xs text-muted-foreground",
    title: row.original.description || "",
    children: row.original.description || "—"
  })
}, {
  accessorKey: "attributes",
  header: "Attributes",
  width: 150,
  minWidth: 120,
  cell: ({
    row
  }) => {
    if (!row.original.attributes) return /*#__PURE__*/_jsx("span", {
      className: "text-xs text-muted-foreground",
      children: "\u2014"
    });
    const keys = Object.keys(row.original.attributes);
    const count = keys.length;
    if (count === 0) return /*#__PURE__*/_jsx("span", {
      className: "text-xs text-muted-foreground",
      children: "\u2014"
    });
    return /*#__PURE__*/_jsx("div", {
      className: "flex flex-wrap items-center gap-1.5",
      children: /*#__PURE__*/_jsx("span", {
        className: "shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground",
        title: `${count} attributes`,
        children: count
      })
    });
  }
}, {
  accessorKey: "sort_sequence",
  header: "Sort",
  width: 100,
  minWidth: 80,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs font-semibold text-muted-foreground",
    children: row.original.sort_sequence ?? "—"
  })
}, {
  id: "actions",
  header: "Actions",
  width: 80,
  minWidth: 80,
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("div", {
    className: "flex items-center",
    onClick: e => e.stopPropagation(),
    children: /*#__PURE__*/_jsxs(DropdownMenu, {
      children: [/*#__PURE__*/_jsx(DropdownMenuTrigger, {
        asChild: true,
        children: /*#__PURE__*/_jsx(Button, {
          variant: "ghost",
          size: "sm",
          className: "h-8 w-8  p-0",
          children: /*#__PURE__*/_jsx(MoreVertical, {
            className: "h-4 w-4 text-muted-foreground"
          })
        })
      }), /*#__PURE__*/_jsxs(DropdownMenuContent, {
        align: "end",
        className: "w-45",
        children: [/*#__PURE__*/_jsxs(DropdownMenuItem, {
          className: " text-xs",
          onClick: () => navigate(`/platform-standard-content/reference-lists/${registryKey}/${row.original.value_code}`),
          children: [/*#__PURE__*/_jsx(Eye, {
            className: "mr-2 h-3.5 w-3.5 text-muted-foreground"
          }), "View Details"]
        }), /*#__PURE__*/_jsxs(DropdownMenuItem, {
          className: " text-xs",
          onClick: () => handleOpenEdit(row.original),
          children: [/*#__PURE__*/_jsx(Edit2, {
            className: "mr-2 h-3.5 w-3.5 text-muted-foreground"
          }), "Edit"]
        })]
      })]
    })
  })
}];

// 13. Tenant Events Audit Table columns
export const tenantEventsTableColumns = [{
  accessorKey: "event_type",
  header: "Event Type",
  width: "25%",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs font-semibold text-foreground",
    children: row.original.event_type || row.original.type || "Unknown"
  })
}, {
  accessorKey: "message",
  header: "Message",
  width: "45%",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs text-muted-foreground",
    children: row.original.message || row.original.detail || "-"
  })
}, {
  accessorKey: "status",
  header: "Status",
  width: "15%",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx(ActiveStatusBadge, {
    status: row.original.status || "Completed"
  })
}, {
  accessorKey: "created_at",
  header: "Created At",
  width: "15%",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "text-xs text-muted-foreground",
    children: row.original.created_at || row.original.timestamp ? new Date(row.original.created_at || row.original.timestamp).toLocaleDateString() : "N/A"
  })
}];

// 14. Platform Users columns
export const getUsersColumns = (navigate, handleOpenEditDialog) => [{
  accessorKey: "name",
  header: "Name",
  width: "28%",
  minWidth: "220px",
  cell: ({
    row
  }) => /*#__PURE__*/_jsxs("div", {
    className: "flex items-center gap-3",
    children: [/*#__PURE__*/_jsx("div", {
      className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-[10px] leading-none font-semibold text-primary uppercase",
      children: getInitials(row.original.full_name) || "U"
    }), /*#__PURE__*/_jsx("div", {
      className: "min-w-0",
      children: /*#__PURE__*/_jsx("p", {
        className: "truncate text-xs font-medium text-foreground",
        children: row.original.full_name || "—"
      })
    })]
  })
}, {
  accessorKey: "email",
  header: "Email",
  width: "30%",
  minWidth: "220px",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("span", {
    className: "block truncate text-xs text-muted-foreground",
    children: row.original.email || "—"
  })
}, {
  accessorKey: "roles",
  header: "Role(s)",
  width: "22%",
  minWidth: "180px",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("div", {
    className: "flex flex-wrap items-center gap-2",
    children: getRolesList(row.original).map(role => /*#__PURE__*/_jsx(RoleBadge, {
      role: role
    }, role))
  })
}, {
  accessorKey: "status",
  header: "Status",
  width: "140px",
  minWidth: "140px",
  rowClassName: "w-40",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx(ActiveStatusBadge, {
    status: row.original.status || "ACTIVE"
  })
}, {
  id: "actions",
  header: "Actions",
  width: "88px",
  minWidth: "88px",
  cell: ({
    row
  }) => /*#__PURE__*/_jsx("div", {
    className: "flex items-center",
    onClick: e => e.stopPropagation(),
    children: /*#__PURE__*/_jsxs(DropdownMenu, {
      children: [/*#__PURE__*/_jsx(DropdownMenuTrigger, {
        asChild: true,
        children: /*#__PURE__*/_jsx(Button, {
          variant: "ghost",
          size: "sm",
          className: "h-8 w-8  p-0",
          children: /*#__PURE__*/_jsx(MoreVertical, {
            className: "h-4 w-4 text-muted-foreground"
          })
        })
      }), /*#__PURE__*/_jsxs(DropdownMenuContent, {
        align: "end",
        className: "w-45",
        children: [/*#__PURE__*/_jsxs(DropdownMenuItem, {
          className: " gap-1.5 text-xs",
          onClick: () => navigate(`/users/${row.original.id}`),
          children: [/*#__PURE__*/_jsx(Eye, {
            className: "h-3.5 w-3.5 text-muted-foreground"
          }), "View Details"]
        }), /*#__PURE__*/_jsxs(DropdownMenuItem, {
          className: " gap-1.5 text-xs",
          onClick: () => handleOpenEditDialog(row.original),
          children: [/*#__PURE__*/_jsx(Edit2, {
            className: "h-3.5 w-3.5 text-muted-foreground"
          }), "Edit"]
        }), /*#__PURE__*/_jsxs(DropdownMenuItem, {
          disabled: true,
          className: "cursor-not-allowed gap-1.5 text-xs text-red-600 opacity-50 focus:text-red-600",
          children: [/*#__PURE__*/_jsx(Trash2, {
            className: "h-3.5 w-3.5"
          }), "Delete"]
        })]
      })]
    })
  })
}];