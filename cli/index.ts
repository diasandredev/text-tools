#!/usr/bin/env node

import { readFileSync } from 'fs'
import { resolve } from 'path'
import {
    type Wrapper,
    type Delimiter,
    type CaseMode,
    DEFAULT_WRAPPER,
    DEFAULT_DELIMITER,
    DEFAULT_CASE,
    DEFAULT_DEDUP,
    DEFAULT_TRIM,
    parseInput,
    transformValues,
    joinValues
} from '../src/core/text-engine.js'

// ── Helpers ──────────────────────────────────────────────

function printHelp(): void {
    const help = `
  text-tools — Normalize, clean & format data lists from the terminal

  Usage:
    text-tools <file>          Process a file
    cat file | text-tools      Process stdin
    text-tools --help          Show this help

  Options:
    -w, --wrapper <type>       Wrapper to apply around each value
                               single-quote | double-quote | parens | none
                               (default: single-quote)

    -d, --delimiter <type>     Delimiter between output values
                               comma | semicolon | newline | comma+newline | pipe
                               or any custom string
                               (default: comma)

    -c, --case <mode>          Case transformation
                               upper | lower | none
                               (default: none)

    --no-dedup                 Keep duplicate values (dedup is ON by default)
    --no-trim                  Keep leading/trailing spaces (trim is ON by default)

    -h, --help                 Show this help message

  Examples:
    text-tools data.txt
    text-tools data.txt -d newline -w double-quote -c upper
    text-tools data.txt --no-dedup --no-trim
    cat data.txt | text-tools -d comma+newline -w none
    text-tools data.txt -d "| " -w parens > output.txt
`
    console.log(help)
}

function resolveWrapper(value: string): Wrapper {
    const map: Record<string, Wrapper> = {
        'single-quote': "'",
        'single': "'",
        "'": "'",
        'double-quote': '"',
        'double': '"',
        '"': '"',
        'parens': '(',
        '(': '(',
        'none': 'none',
    }
    const resolved = map[value.toLowerCase()]
    if (!resolved) {
        console.error(`Error: Invalid wrapper "${value}". Use: single-quote, double-quote, parens, none`)
        process.exit(1)
    }
    return resolved
}

function resolveDelimiter(value: string): { delimiter: Delimiter; custom: string } {
    const map: Record<string, Delimiter> = {
        'comma': ',',
        ',': ',',
        'semicolon': ';',
        ';': ';',
        'newline': 'NEWLINE',
        'new-line': 'NEWLINE',
        'comma+newline': 'COMMA_NEWLINE',
        'comma+new-line': 'COMMA_NEWLINE',
        'pipe': '|',
        '|': '|',
    }
    const resolved = map[value.toLowerCase()]
    if (resolved) {
        return { delimiter: resolved, custom: '' }
    }
    // Treat as custom delimiter string
    return { delimiter: 'custom', custom: value }
}

function resolveCase(value: string): CaseMode {
    const map: Record<string, CaseMode> = {
        'upper': 'upper',
        'uppercase': 'upper',
        'lower': 'lower',
        'lowercase': 'lower',
        'none': 'none',
    }
    const resolved = map[value.toLowerCase()]
    if (!resolved) {
        console.error(`Error: Invalid case mode "${value}". Use: upper, lower, none`)
        process.exit(1)
    }
    return resolved
}

// ── Arg parsing ──────────────────────────────────────────

interface CliOptions {
    filePath: string | null
    wrapper: Wrapper
    delimiter: Delimiter
    customDelimiter: string
    caseMode: CaseMode
    dedup: boolean
    trim: boolean
}

function parseArgs(args: string[]): CliOptions {
    const opts: CliOptions = {
        filePath: null,
        wrapper: DEFAULT_WRAPPER,
        delimiter: DEFAULT_DELIMITER,
        customDelimiter: '',
        caseMode: DEFAULT_CASE,
        dedup: DEFAULT_DEDUP,
        trim: DEFAULT_TRIM,
    }

    let i = 0
    while (i < args.length) {
        const arg = args[i]

        if (arg === '-h' || arg === '--help') {
            printHelp()
            process.exit(0)
        } else if (arg === '-w' || arg === '--wrapper') {
            i++
            if (!args[i]) { console.error('Error: --wrapper requires a value'); process.exit(1) }
            opts.wrapper = resolveWrapper(args[i])
        } else if (arg === '-d' || arg === '--delimiter') {
            i++
            if (!args[i]) { console.error('Error: --delimiter requires a value'); process.exit(1) }
            const { delimiter, custom } = resolveDelimiter(args[i])
            opts.delimiter = delimiter
            opts.customDelimiter = custom
        } else if (arg === '-c' || arg === '--case') {
            i++
            if (!args[i]) { console.error('Error: --case requires a value'); process.exit(1) }
            opts.caseMode = resolveCase(args[i])
        } else if (arg === '--no-dedup') {
            opts.dedup = false
        } else if (arg === '--no-trim') {
            opts.trim = false
        } else if (!arg.startsWith('-')) {
            opts.filePath = arg
        } else {
            console.error(`Error: Unknown flag "${arg}". Use --help for usage.`)
            process.exit(1)
        }

        i++
    }

    return opts
}

// ── Read input ───────────────────────────────────────────

function readFromFile(filePath: string): string {
    try {
        return readFileSync(resolve(filePath), 'utf-8')
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`Error: Could not read file "${filePath}"\n${msg}`)
        process.exit(1)
    }
}

function readFromStdin(): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = []
        process.stdin.on('data', (chunk) => chunks.push(chunk))
        process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
        process.stdin.on('error', reject)
    })
}

// ── Main ─────────────────────────────────────────────────

async function main(): Promise<void> {
    const args = process.argv.slice(2)

    if (args.length === 0 && process.stdin.isTTY) {
        printHelp()
        process.exit(0)
    }

    const opts = parseArgs(args)

    // Read input
    let input: string
    if (opts.filePath) {
        input = readFromFile(opts.filePath)
    } else {
        input = await readFromStdin()
    }

    // Process
    const parsed = parseInput(input)

    if (parsed.length === 0) {
        process.exit(0)
    }

    const transformed = transformValues(parsed, opts.wrapper, opts.dedup, opts.caseMode, opts.trim)
    const output = joinValues(transformed, opts.delimiter, opts.customDelimiter)

    // Output
    process.stdout.write(output + '\n')
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
