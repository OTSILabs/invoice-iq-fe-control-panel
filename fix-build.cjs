const fs = require('fs');

function replaceInFile(filePath, oldText, newText) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(oldText, newText);
  fs.writeFileSync(filePath, content, 'utf8');
}

// 1. organization-detail.tsx
const orgDetail = 'src/pages/organization/organization-detail.tsx';
replaceInFile(orgDetail, 
  'const [tenantToExpire, setTenantToExpire] = useState<Tenant | null>(null)\n  const [tenantToExpire, setTenantToExpire] = useState<Tenant | null>(null)', 
  'const [tenantToExpire, setTenantToExpire] = useState<Tenant | null>(null)'
);
replaceInFile(orgDetail, 'import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"', 'import { useQuery } from "@tanstack/react-query"');
replaceInFile(orgDetail, 'import { Loader2, Info, Users, Plus, MoreHorizontal, MoreVertical, Eye, Edit, Trash2, Ban, CheckCircle2, Lock, Unlock, Clock } from "lucide-react"', 'import { Loader2, Info, Users, Plus, MoreVertical, Eye, Trash2, Ban, CheckCircle2, Lock, Unlock, Clock } from "lucide-react"');
replaceInFile(orgDetail, 'import { Input } from "@/components/ui/input"\n', '');
replaceInFile(orgDetail, 'import { Label } from "@/components/ui/label"\n', '');
replaceInFile(orgDetail, '  const queryClient = useQueryClient()\n', '');

// 2. configurations-table.tsx
const configTable = 'src/components/configurations-table.tsx';
replaceInFile(configTable, 'import { Eye, Edit } from "lucide-react"\n', '');
replaceInFile(configTable, 'import { Eye, Edit } from "lucide-react";\n', '');

// 3. create-organization-modal.tsx
const createModal = 'src/components/create-organization-modal.tsx';
replaceInFile(createModal, 'Building, Loader2, Save, CheckCircle2', 'Building, Loader2');
replaceInFile(createModal, 'DialogTrigger, DialogClose', 'DialogTrigger');
replaceInFile(createModal, 'import { Input } from "@/components/ui/input"\n', '');
replaceInFile(createModal, 'const [createdOrgId, setCreatedOrgId] = useState<string | null>(null)\n', '');

// 4. layout.tsx
const layout = 'src/components/layout.tsx';
replaceInFile(layout, 'map((item, index)', 'map((item)');

// 5. team-switcher.tsx
const teamSwitcher = 'src/components/team-switcher.tsx';
replaceInFile(teamSwitcher, 'import * as React from "react"\n', '');
replaceInFile(teamSwitcher, 'import React, { useState } from "react"', 'import { useState } from "react"');

// 6. tenant-events-table.tsx
const eventsTable = 'src/components/tenant-events-table.tsx';
replaceInFile(eventsTable, 'import { Loader2, Search } from "lucide-react"', 'import { Search } from "lucide-react"');

// 7. calendar.tsx
const calendar = 'src/components/ui/calendar.tsx';
replaceInFile(calendar, 'table: "w-full border-collapse",\n', '// @ts-expect-error table is deprecated in some versions\n        table: "w-full border-collapse",\n');

// 8. pagination-component.tsx
const pagination = 'src/components/ui/pagination-component.tsx';
replaceInFile(pagination, 'import React from "react";\n', '');

// 9. tenant-detail.tsx
const tenantDetail = 'src/pages/organization/tenant-detail.tsx';
replaceInFile(tenantDetail, 'const { data: organization, isLoading: isOrgLoading } = useQuery({', 'const { isLoading: isOrgLoading } = useQuery({');

console.log('Fixed all');
