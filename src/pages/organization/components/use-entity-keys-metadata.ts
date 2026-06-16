import { useMemo } from "react"

export interface EntityKeyMetadata {
  defaultValue: string
  isBoolean: boolean
  isRequired: boolean
  label: string
}

export function useEntityKeysMetadata(
  keysList: unknown[],
  entityType: 'organization' | 'tenant',
  existingKeys: Set<string>,
  isAdding: boolean
) {
  const apiKeysMetadata = useMemo(() => {
    const metadata: Record<string, EntityKeyMetadata> = {}
    
    ;(keysList as unknown[]).forEach((item) => {
      const isObj = typeof item === "object" && item !== null
      const obj = item as Record<string, unknown>
      const key = typeof item === "string" ? item : String(obj.key || obj.name || "")
      if (!key) return
      
      // Check scope compatibility (applies to both applies_to and allowed_scopes)
      let isScopeCompatible = true
      const appliesTo = obj.applies_to !== undefined ? String(obj.applies_to).toLowerCase() : ""
      
      if (appliesTo) {
        if (entityType === "organization") {
          isScopeCompatible = appliesTo === "organisation" || appliesTo === "organization" || appliesTo === "both"
        } else if (entityType === "tenant") {
          isScopeCompatible = appliesTo === "tenant" || appliesTo === "tent" || appliesTo === "both"
        }
      } else {
        const rawScopes = obj.allowed_scopes !== undefined ? obj.allowed_scopes :
                          obj.allowed_scope !== undefined ? obj.allowed_scope :
                          obj.scopes !== undefined ? obj.scopes : null;
        
        if (rawScopes !== null && rawScopes !== undefined) {
          const scopesList = Array.isArray(rawScopes)
            ? rawScopes.map(s => String(s).toLowerCase())
            : [String(rawScopes).toLowerCase()]
          
          if (entityType === "organization") {
            isScopeCompatible = scopesList.some(s => 
              s.includes("organisation") || 
              s.includes("organization") || 
              s.includes("org") || 
              s.includes("both")
            )
          } else if (entityType === "tenant") {
            isScopeCompatible = scopesList.some(s => 
              s.includes("tenant") || 
              s.includes("both")
            )
          }
        }
      }
      
      if (!isScopeCompatible) return
      
      const label = isObj ? String(obj.label || obj.description || key) : key
      const isRequired = isObj ? Boolean(obj.is_required || obj.required) : false
      
      let defaultValue = ""
      if (isObj) {
        const rawDefault = obj.default_value !== undefined ? obj.default_value :
                           obj.defaultValue !== undefined ? obj.defaultValue :
                           obj.default !== undefined ? obj.default : "";
        if (rawDefault !== null && rawDefault !== undefined) {
          defaultValue = String(rawDefault)
        }
      }
      
      let isBoolean = false
      if (isObj) {
        const isBool = (val: unknown): val is boolean => typeof val === "boolean"
        if (isBool(obj.default_value) || isBool(obj.defaultValue) || isBool(obj.default)) {
          isBoolean = true
        } else if (obj.type === "boolean" || obj.value_type === "boolean") {
          isBoolean = true
        } else {
          const rawStr = String(obj.default_value || obj.defaultValue || obj.default || "").toLowerCase()
          if (rawStr === "true" || rawStr === "false") {
            isBoolean = true
          }
        }
      }
      
      metadata[key] = { defaultValue, isBoolean, isRequired, label }
    })
    
    return metadata
  }, [keysList, entityType])

  const newKeysToAdd = useMemo(() => {
    if (!isAdding) return []
    const keys: string[] = []
    for (const item of (keysList as unknown[])) {
      const obj = item as Record<string, string>
      const key = typeof item === "string" ? item : (obj.key || obj.name || "")
      if (key && apiKeysMetadata[key] && !existingKeys.has(key)) {
        keys.push(key)
      }
    }
    return keys
  }, [keysList, existingKeys, isAdding, apiKeysMetadata])

  return { apiKeysMetadata, newKeysToAdd }
}
