export type Wrapper = "'" | '"' | '(' | 'none'
export type Delimiter = ',' | ';' | 'NEWLINE' | 'COMMA_NEWLINE' | '|' | 'custom'
export type CaseMode = 'none' | 'upper' | 'lower'

export const DEFAULT_WRAPPER: Wrapper = "'"
export const DEFAULT_DELIMITER: Delimiter = ','
export const DEFAULT_CASE: CaseMode = 'none'
export const DEFAULT_DEDUP = true
export const DEFAULT_TRIM = true

export function parseInput(text: string): string[] {
    const delimiterPattern = /[,;\n|]+/
    const parts = text.split(delimiterPattern)

    return parts
        .map(part => {
            let trimmed = part.trim()
            if (
                (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
                (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
                (trimmed.startsWith('(') && trimmed.endsWith(')'))
            ) {
                trimmed = trimmed.slice(1, -1)
            }
            return trimmed.trim()
        })
        .filter(part => part.length > 0)
}

export function transformValues(
    values: string[],
    wrapper: Wrapper,
    dedup: boolean,
    caseMode: CaseMode,
    trim: boolean
): string[] {
    let result = [...values]

    if (trim) {
        result = result.map(v => v.trim())
    }

    if (caseMode === 'upper') {
        result = result.map(v => v.toUpperCase())
    } else if (caseMode === 'lower') {
        result = result.map(v => v.toLowerCase())
    }

    if (dedup) {
        result = [...new Set(result)]
    }

    if (wrapper !== 'none') {
        result = result.map(v => {
            if (wrapper === '(') return `(${v})`
            return `${wrapper}${v}${wrapper}`
        })
    }

    return result
}

export function joinValues(
    values: string[],
    delimiter: Delimiter,
    customDelimiter: string
): string {
    if (delimiter === 'NEWLINE') return values.join('\n')
    if (delimiter === 'COMMA_NEWLINE') return values.join(',\n')
    const delim = delimiter === 'custom' ? customDelimiter : delimiter
    return values.join(delim)
}
