const fs = require('fs');

function replaceInFile(filePath, regex, newText) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(regex, newText);
  fs.writeFileSync(filePath, content, 'utf8');
}

// 1. configurations-table.tsx
const configTable = 'src/components/configurations-table.tsx';
replaceInFile(configTable, /import \{\s*DropdownMenu[\s\S]*?\} from "@\/components\/ui\/dropdown-menu"/, '');
replaceInFile(configTable, /import \{ Eye, Edit, Trash2 \} from "lucide-react"/, 'import { Trash2 } from "lucide-react"');

// 2. create-organization-modal.tsx
const createModal = 'src/components/create-organization-modal.tsx';
replaceInFile(createModal, /Save,\s*/g, '');
replaceInFile(createModal, /CheckCircle2,\s*/g, '');
replaceInFile(createModal, /DialogClose,\s*/g, '');
replaceInFile(createModal, /Loader2,\s*/g, '');

// 3. layout.tsx
const layout = 'src/components/layout.tsx';
replaceInFile(layout, /breadcrumbs\.map\(\(crumb, index\)/, 'breadcrumbs.map((crumb)');

// 4. tenant-events-table.tsx
const eventsTable = 'src/components/tenant-events-table.tsx';
replaceInFile(eventsTable, /Loader2,\s*/g, '');

// 5. pagination-component.tsx
const pagination = 'src/components/ui/pagination-component.tsx';
replaceInFile(pagination, /import React from "react";?\n/, '');
replaceInFile(pagination, /import \* as React from "react";?\n/, '');

// 6. tenant-detail.tsx
const tenantDetail = 'src/pages/organization/tenant-detail.tsx';
replaceInFile(tenantDetail, /const \{ data: organization, isLoading: isOrgLoading \} = useQuery/, 'const { isLoading: isOrgLoading } = useQuery');

console.log('Fixed final');
