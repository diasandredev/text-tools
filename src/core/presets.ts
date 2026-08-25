import { type TransformConfig } from './text-engine.js'

export interface FormatterPreset {
    id: string
    name: string
    description?: string
    icon?: string
    isCustom?: boolean
    createdAt?: number
    config: TransformConfig
}

export const SYSTEM_PRESETS: FormatterPreset[] = [
    {
        id: 'sql-in',
        name: "SQL 'IN'",
        description: "SQL IN clause ('a', 'b', 'c')",
        config: {
            wrapper: "'",
            delimiter: ',',
            caseMode: 'none',
            sortMode: 'none',
            dedup: true,
            trim: true,
            enclosure: 'none'
        }
    },
    {
        id: 'json-array',
        name: 'JSON Array',
        description: 'String array ["item1", "item2"]',
        config: {
            wrapper: '"',
            delimiter: ',',
            caseMode: 'none',
            sortMode: 'none',
            dedup: true,
            trim: true,
            enclosure: 'brackets'
        }
    },
    {
        id: 'lines-to-comma',
        name: 'Lines → Comma',
        description: 'Convert newlines to comma-separated list',
        config: {
            wrapper: 'none',
            delimiter: ',',
            caseMode: 'none',
            sortMode: 'none',
            dedup: false,
            trim: true,
            enclosure: 'none'
        }
    },
    {
        id: 'comma-to-lines',
        name: 'Comma → Lines',
        description: 'Split comma list into separate lines',
        config: {
            wrapper: 'none',
            delimiter: 'NEWLINE',
            caseMode: 'none',
            sortMode: 'none',
            dedup: false,
            trim: true,
            enclosure: 'none'
        }
    },
    {
        id: 'markdown-list',
        name: 'Markdown List',
        description: 'Task checklist / bullet points',
        config: {
            wrapper: 'custom',
            customWrapperPrefix: '- [ ] ',
            customWrapperSuffix: '',
            delimiter: 'NEWLINE',
            caseMode: 'none',
            sortMode: 'none',
            dedup: false,
            trim: true,
            enclosure: 'none'
        }
    },
    {
        id: 'snake-case',
        name: 'snake_case',
        description: 'Standardized lowercase snake_case identifiers',
        config: {
            wrapper: 'none',
            delimiter: 'NEWLINE',
            caseMode: 'snake',
            sortMode: 'asc',
            dedup: true,
            trim: true,
            enclosure: 'none'
        }
    },
    {
        id: 'camel-case',
        name: 'camelCase',
        description: 'Sorted camelCase identifier list',
        config: {
            wrapper: 'none',
            delimiter: 'NEWLINE',
            caseMode: 'camel',
            sortMode: 'asc',
            dedup: true,
            trim: true,
            enclosure: 'none'
        }
    },
    {
        id: 'clean-dedup-az',
        name: 'Clean & Sort A-Z',
        description: 'Trim spaces, deduplicate, and sort alphabetically',
        config: {
            wrapper: 'none',
            delimiter: 'NEWLINE',
            caseMode: 'none',
            sortMode: 'asc',
            dedup: true,
            trim: true,
            enclosure: 'none'
        }
    }
]

const STORAGE_KEY_PRESETS = 'text_tools_custom_presets'
const STORAGE_KEY_SAVED_STATE = 'text_tools_saved_state'

export function getCustomPresets(): FormatterPreset[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_PRESETS)
        if (!stored) return []
        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

export function getAllPresets(): FormatterPreset[] {
    return [...SYSTEM_PRESETS, ...getCustomPresets()]
}

export function saveCustomPreset(name: string, config: TransformConfig, icon = '⭐', description = ''): FormatterPreset {
    const existing = getCustomPresets()
    const newPreset: FormatterPreset = {
        id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: name.trim(),
        description: description.trim(),
        icon,
        isCustom: true,
        createdAt: Date.now(),
        config
    }
    const updated = [...existing, newPreset]
    localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(updated))
    return newPreset
}

export function updateCustomPreset(preset: FormatterPreset): void {
    const existing = getCustomPresets()
    const updated = existing.map(p => p.id === preset.id ? preset : p)
    localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(updated))
}

export function deleteCustomPreset(id: string): void {
    const existing = getCustomPresets()
    const updated = existing.filter(p => p.id !== id)
    localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(updated))
}

export function exportCustomPresetsJSON(): string {
    const presets = getCustomPresets()
    return JSON.stringify(presets, null, 2)
}

export function importCustomPresetsJSON(jsonStr: string): { success: boolean; count: number; error?: string } {
    try {
        const parsed = JSON.parse(jsonStr)
        if (!Array.isArray(parsed)) {
            return { success: false, count: 0, error: 'JSON format must be an array of formatters.' }
        }

        const validPresets: FormatterPreset[] = parsed.filter(p => p.name && p.config).map(p => ({
            ...p,
            id: p.id || `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            isCustom: true
        }))

        const existing = getCustomPresets()
        // Deduplicate by name/id
        const existingIds = new Set(existing.map(e => e.id))
        const merged = [...existing]
        let addedCount = 0

        for (const p of validPresets) {
            if (!existingIds.has(p.id)) {
                merged.push(p)
                addedCount++
            }
        }

        localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(merged))
        return { success: true, count: addedCount }
    } catch (err) {
        return { success: false, count: 0, error: (err as Error).message }
    }
}

export interface UserPreferences {
    config?: Partial<TransformConfig>
    layout?: 'split' | 'stacked'
}

export function getSavedPreferences(): UserPreferences | null {
    try {
        const data = localStorage.getItem(STORAGE_KEY_SAVED_STATE)
        if (!data) return null
        const parsed = JSON.parse(data)
        return {
            config: parsed.config,
            layout: parsed.layout
        }
    } catch {
        return null
    }
}

export function savePreferences(prefs: UserPreferences): void {
    try {
        localStorage.setItem(STORAGE_KEY_SAVED_STATE, JSON.stringify(prefs))
    } catch {
        // Handle storage quota exceed gracefully
    }
}
