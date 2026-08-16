export type Wrapper = "'" | '"' | '`' | '(' | '[' | '{' | 'none' | 'custom'
export type Delimiter = ',' | ';' | 'NEWLINE' | 'COMMA_NEWLINE' | '|' | 'TAB' | 'SPACE' | 'custom'
export type CaseMode = 'none' | 'upper' | 'lower' | 'title' | 'camel' | 'snake' | 'kebab' | 'pascal'
export type SortMode = 'none' | 'asc' | 'desc' | 'length-asc' | 'length-desc' | 'reverse' | 'shuffle'
export type EnclosureMode = 'none' | 'parens' | 'brackets' | 'braces' | 'custom'

export interface TransformConfig {
    wrapper: Wrapper
    customWrapperPrefix?: string
    customWrapperSuffix?: string
    delimiter: Delimiter
    customDelimiter?: string
    caseMode: CaseMode
    sortMode?: SortMode
    dedup: boolean
    trim: boolean
    removeEmpty?: boolean
    regexFilter?: string
    regexFilterMode?: 'include' | 'exclude'
    enclosure?: EnclosureMode
    customEnclosureStart?: string
    customEnclosureEnd?: string
}

export const DEFAULT_WRAPPER: Wrapper = "'"
export const DEFAULT_DELIMITER: Delimiter = ','
export const DEFAULT_CASE: CaseMode = 'none'
export const DEFAULT_SORT: SortMode = 'none'
export const DEFAULT_DEDUP = true
export const DEFAULT_TRIM = true
export const DEFAULT_ENCLOSURE: EnclosureMode = 'none'

export const DEFAULT_CONFIG: TransformConfig = {
    wrapper: DEFAULT_WRAPPER,
    customWrapperPrefix: '',
    customWrapperSuffix: '',
    delimiter: DEFAULT_DELIMITER,
    customDelimiter: '',
    caseMode: DEFAULT_CASE,
    sortMode: DEFAULT_SORT,
    dedup: DEFAULT_DEDUP,
    trim: DEFAULT_TRIM,
    removeEmpty: true,
    regexFilter: '',
    regexFilterMode: 'include',
    enclosure: DEFAULT_ENCLOSURE,
    customEnclosureStart: '',
    customEnclosureEnd: ''
}

export function parseInput(text: string): string[] {
    if (!text) return []
    // Split by comma, semicolon, newline, pipe, or tab (when repeated/mixed)
    const delimiterPattern = /[,;\n|\t]+/
    const parts = text.split(delimiterPattern)

    return parts
        .map(part => {
            let trimmed = part.trim()
            if (
                (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
                (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
                (trimmed.startsWith('`') && trimmed.endsWith('`')) ||
                (trimmed.startsWith('(') && trimmed.endsWith(')')) ||
                (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
                (trimmed.startsWith('{') && trimmed.endsWith('}'))
            ) {
                trimmed = trimmed.slice(1, -1)
            }
            return trimmed.trim()
        })
        .filter(part => part.length > 0)
}

function toCamelCase(str: string): string {
    const words = str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) || [str]
    return words
        .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('')
}

function toPascalCase(str: string): string {
    const words = str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) || [str]
    return words
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('')
}

function toSnakeCase(str: string): string {
    const words = str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) || [str]
    return words.map(w => w.toLowerCase()).join('_')
}

function toKebabCase(str: string): string {
    const words = str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) || [str]
    return words.map(w => w.toLowerCase()).join('-')
}

function toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())
}

export function applyCase(value: string, caseMode: CaseMode): string {
    switch (caseMode) {
        case 'upper': return value.toUpperCase()
        case 'lower': return value.toLowerCase()
        case 'title': return toTitleCase(value)
        case 'camel': return toCamelCase(value)
        case 'snake': return toSnakeCase(value)
        case 'kebab': return toKebabCase(value)
        case 'pascal': return toPascalCase(value)
        default: return value
    }
}

export function applyWrap(
    value: string,
    wrapper: Wrapper,
    customPrefix = '',
    customSuffix = ''
): string {
    switch (wrapper) {
        case "'": return `'${value}'`
        case '"': return `"${value}"`
        case '`': return `\`${value}\``
        case '(': return `(${value})`
        case '[': return `[${value}]`
        case '{': return `{${value}}`
        case 'custom': return `${customPrefix}${value}${customSuffix}`
        case 'none':
        default:
            return value
    }
}

export function transformValues(
    values: string[],
    wrapper: Wrapper,
    dedup: boolean,
    caseMode: CaseMode,
    trim: boolean,
    sortMode: SortMode = 'none',
    customPrefix = '',
    customSuffix = '',
    regexFilter = '',
    regexFilterMode: 'include' | 'exclude' = 'include'
): string[] {
    let result = [...values]

    if (trim) {
        result = result.map(v => v.trim())
    }

    if (regexFilter) {
        try {
            const regex = new RegExp(regexFilter, 'i')
            result = result.filter(v => regexFilterMode === 'include' ? regex.test(v) : !regex.test(v))
        } catch {
            // If regex is invalid, skip filtering
        }
    }

    if (caseMode !== 'none') {
        result = result.map(v => applyCase(v, caseMode))
    }

    if (dedup) {
        result = [...new Set(result)]
    }

    if (sortMode !== 'none') {
        if (sortMode === 'asc') {
            result.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
        } else if (sortMode === 'desc') {
            result.sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }))
        } else if (sortMode === 'length-asc') {
            result.sort((a, b) => a.length - b.length || a.localeCompare(b))
        } else if (sortMode === 'length-desc') {
            result.sort((a, b) => b.length - a.length || a.localeCompare(b))
        } else if (sortMode === 'reverse') {
            result.reverse()
        } else if (sortMode === 'shuffle') {
            result = [...result].sort(() => Math.random() - 0.5)
        }
    }

    if (wrapper !== 'none') {
        result = result.map(v => applyWrap(v, wrapper, customPrefix, customSuffix))
    }

    return result
}

export function joinValues(
    values: string[],
    delimiter: Delimiter,
    customDelimiter = '',
    enclosure: EnclosureMode = 'none',
    customEnclosureStart = '',
    customEnclosureEnd = ''
): string {
    if (values.length === 0) return ''

    let delim = ','
    switch (delimiter) {
        case 'NEWLINE': delim = '\n'; break
        case 'COMMA_NEWLINE': delim = ',\n'; break
        case 'TAB': delim = '\t'; break
        case 'SPACE': delim = ' '; break
        case '|': delim = ' | '; break
        case ';': delim = '; '; break
        case ',': delim = ', '; break
        case 'custom': delim = customDelimiter; break
        default: delim = delimiter
    }

    const joined = values.join(delim)

    switch (enclosure) {
        case 'parens': return `(\n  ${joined}\n)`
        case 'brackets': return `[\n  ${joined}\n]`
        case 'braces': return `{\n  ${joined}\n}`
        case 'custom': return `${customEnclosureStart}${joined}${customEnclosureEnd}`
        case 'none':
        default:
            return joined
    }
}
