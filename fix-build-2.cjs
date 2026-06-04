const fs = require('fs');

function replaceInFile(filePath, oldText, newText) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(oldText, newText);
  fs.writeFileSync(filePath, content, 'utf8');
}

// 1. configurations-table.tsx
const configTable = 'src/components/configurations-table.tsx';
replaceInFile(configTable, 'import { Eye, Edit } from "lucide-react"\n', '');
replaceInFile(configTable, 'import { Eye, Edit } from "lucide-react";\n', '');
replaceInFile(configTable, 'import { Loader2, Plus, Building, Trash2, Eye, Edit } from "lucide-react"', 'import { Loader2, Plus, Building, Trash2 } from "lucide-react"');

// 2. create-organization-modal.tsx
const createModal = 'src/components/create-organization-modal.tsx';
replaceInFile(createModal, 'Building, Loader2, Save, CheckCircle2', 'Building, Loader2');
replaceInFile(createModal, 'DialogTrigger, DialogClose', 'DialogTrigger');

// 3. layout.tsx
const layout = 'src/components/layout.tsx';
replaceInFile(layout, 'map((item, index)', 'map((item)');

// 4. tenant-events-table.tsx
const eventsTable = 'src/components/tenant-events-table.tsx';
replaceInFile(eventsTable, 'import { Loader2, Search } from "lucide-react"', 'import { Search } from "lucide-react"');

// 5. pagination-component.tsx
const pagination = 'src/components/ui/pagination-component.tsx';
replaceInFile(pagination, 'import React from "react";\n', '');
replaceInFile(pagination, 'import * as React from "react"\n', '');

// 6. tenant-detail.tsx
const tenantDetail = 'src/pages/organization/tenant-detail.tsx';
replaceInFile(tenantDetail, 'const { data: organization, isLoading: isOrgLoading } = useQuery({', 'const { isLoading: isOrgLoading } = useQuery({');

console.log('Fixed remaining');
