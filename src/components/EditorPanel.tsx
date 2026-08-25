import { useState, useRef, useCallback, useMemo, type DragEvent, type ChangeEvent } from 'react'
import { showToast } from '../core/toast.js'
import { MODIFIER_KEY } from '../core/platform.js'

interface EditorPanelProps {
    input: string
    onChangeInput: (val: string) => void
    output: string
    parsedCount: number
    uniqueCount: number
    transformedCount: number
    loadedFile: { name: string; size: number } | null
    onLoadedFile: (content: string, name: string, size: number) => void
    onRemoveFile: () => void
    onSwap: () => void
    layout: 'split' | 'stacked'
}

const SAMPLE_DATA = `usr_98a72b14
usr_12c98d45
"usr_98a72b14"
usr_44e12f88
usr_12c98d45
usr_77a90c23
usr_88b11a90`

export default function EditorPanel({
    input,
    onChangeInput,
    output,
    parsedCount,
    uniqueCount,
    transformedCount,
    loadedFile,
    onLoadedFile,
    onRemoveFile,
    onSwap,
    layout
}: EditorPanelProps) {
    const [copied, setCopied] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [wordWrap, setWordWrap] = useState(true)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const inputGutterRef = useRef<HTMLPreElement>(null)
    const outputGutterRef = useRef<HTMLPreElement>(null)
    const dragCounter = useRef(0)

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const handleCopy = () => {
        if (!output) return
        navigator.clipboard.writeText(output)
        setCopied(true)
        showToast('Copied!', `${transformedCount} items copied to clipboard.`, 'success')
        setTimeout(() => setCopied(false), 2000)
    }

    const handlePasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText()
            if (text) {
                onChangeInput(text)
                showToast('Pasted!', 'Clipboard text inserted.', 'info')
            }
        } catch {
            showToast('Permission Denied', 'Unable to access clipboard.', 'warning')
        }
    }

    const handleLoadSample = () => {
        onChangeInput(SAMPLE_DATA)
        showToast('Sample Loaded', 'Test data inserted into editor.', 'info')
    }

    const handleDownload = (format: 'txt' | 'json' | 'csv') => {
        if (!output) return
        const content = output
        let mime = 'text/plain'
        const filename = `text-tools-output.${format}`

        if (format === 'json') {
            mime = 'application/json'
        } else if (format === 'csv') {
            mime = 'text/csv'
        }

        const blob = new Blob([content], { type: `${mime};charset=utf-8` })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
        showToast('Download Started', `${filename} generated.`, 'success')
    }

    const processDroppedFile = useCallback((file: File) => {
        const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
        const reader = new FileReader()
        reader.onload = () => {
            const text = reader.result as string
            let parsedText = text

            if (ext === '.csv') {
                const lines = text.trim().split('\n')
                const vals: string[] = []
                for (const line of lines) {
                    const cells = line.match(/(".*?"|[^,]+)/g) || []
                    for (const cell of cells) {
                        const clean = cell.trim().replace(/^"|"$/g, '')
                        if (clean) vals.push(clean)
                    }
                }
                parsedText = vals.join('\n')
            } else if (ext === '.json') {
                try {
                    const data = JSON.parse(text)
                    const vals: string[] = []
                    const walk = (obj: unknown) => {
                        if (Array.isArray(obj)) obj.forEach(walk)
                        else if (typeof obj === 'object' && obj !== null) Object.values(obj).forEach(walk)
                        else if (obj !== null && obj !== undefined) vals.push(String(obj))
                    }
                    walk(data)
                    parsedText = vals.join('\n')
                } catch {
                    parsedText = text
                }
            }

            onLoadedFile(parsedText, file.name, file.size)
            showToast('File Loaded', `${file.name} (${formatSize(file.size)}) ready.`, 'success')
        }
        reader.readAsText(file)
    }, [onLoadedFile])

    const handleDragEnter = (e: DragEvent) => {
        e.preventDefault()
        dragCounter.current++
        setIsDragging(true)
    }

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault()
        dragCounter.current--
        if (dragCounter.current <= 0) {
            setIsDragging(false)
            dragCounter.current = 0
        }
    }

    const handleDrop = (e: DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        dragCounter.current = 0
        const file = e.dataTransfer.files?.[0]
        if (file) processDroppedFile(file)
    }

    const inputLineGutter = useMemo(() => {
        const total = (input || '').split('\n').length
        let str = ''
        for (let i = 1; i <= total; i++) {
            str += i + '\n'
        }
        return str
    }, [input])

    const outputLineGutter = useMemo(() => {
        const total = (output || '').split('\n').length
        let str = ''
        for (let i = 1; i <= total; i++) {
            str += i + '\n'
        }
        return str
    }, [output])

    const duplicatesRemoved = Math.max(0, parsedCount - transformedCount)

    return (
        <div className={`grid gap-5 mb-6 items-stretch ${layout === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Input Panel */}
            <section aria-label="Input editor section" className="flex flex-col bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-lg h-[440px]">
                {/* Header */}
                <div className="h-11 min-h-[44px] flex items-center justify-between px-3.5 bg-[#0d1117] border-b border-[#21262d] text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold uppercase tracking-wider text-[#8b949e] flex items-center gap-1.5 whitespace-nowrap text-xs">
                            <span className="w-2 h-2 rounded-full bg-[#39d353]" /> INPUT
                        </span>
                        {loadedFile ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-[#238636]/20 border border-[#238636]/40 text-[#39d353] rounded text-[11px] whitespace-nowrap truncate max-w-[140px]">
                                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span className="truncate">{loadedFile.name}</span>
                                <button
                                    onClick={onRemoveFile}
                                    className="hover:text-white font-bold ml-1 text-xs"
                                    title="Remove file"
                                    aria-label="Remove uploaded file"
                                >
                                    ✕
                                </button>
                            </span>
                        ) : (
                            input && (
                                <span className="text-[11px] text-[#8b949e] bg-[#161b22] px-2 py-0.5 rounded border border-[#21262d] whitespace-nowrap">
                                    {parsedCount} items
                                </span>
                            )
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            onClick={handlePasteFromClipboard}
                            className="h-7 px-2.5 py-1 bg-[#161b22] hover:bg-[#21262d] text-[#c9d1d9] hover:text-white border border-[#30363d] rounded-md text-xs transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
                            title={`Paste from clipboard (${MODIFIER_KEY}+Shift+V)`}
                            aria-label="Paste from clipboard"
                        >
                            <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span>Paste</span>
                        </button>
                        <button
                            onClick={handleLoadSample}
                            className="h-7 px-2.5 py-1 bg-[#161b22] hover:bg-[#21262d] text-[#c9d1d9] hover:text-white border border-[#30363d] rounded-md text-xs transition-colors font-medium whitespace-nowrap"
                            title="Load sample data"
                            aria-label="Load sample data"
                        >
                            Sample
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="h-7 px-2.5 py-1 bg-[#161b22] hover:bg-[#21262d] text-[#c9d1d9] hover:text-white border border-[#30363d] rounded-md text-xs transition-colors font-medium whitespace-nowrap"
                            title="Upload file (.txt, .csv, .json, .tsv, .xml)"
                            aria-label="Upload file"
                        >
                            File
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt,.csv,.json,.tsv,.xml"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const file = e.target.files?.[0]
                                if (file) processDroppedFile(file)
                                if (fileInputRef.current) fileInputRef.current.value = ''
                            }}
                            className="hidden"
                            aria-label="File upload input"
                        />
                        {input && (
                            <button
                                onClick={() => { onChangeInput(''); onRemoveFile() }}
                                className="h-7 px-2 py-1 text-[#f85149] hover:bg-[#f85149]/10 rounded-md text-xs transition-colors font-medium whitespace-nowrap"
                                title="Clear input text"
                                aria-label="Clear input text"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Editor Body with Line Numbers & Drag-Drop Overlay */}
                <div
                    className="relative flex-1 flex overflow-hidden bg-[#0d1117]"
                    onDragEnter={handleDragEnter}
                    onDragOver={e => e.preventDefault()}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {/* Drag and drop glowing overlay */}
                    {isDragging && (
                        <div className="absolute inset-0 z-30 bg-[#0d1117]/95 border-2 border-dashed border-[#39d353] flex flex-col items-center justify-center gap-2 backdrop-blur-xs animate-in fade-in duration-100">
                            <svg className="w-10 h-10 text-[#39d353] animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                            <span className="text-sm font-semibold text-[#39d353]">Drop file to import</span>
                            <span className="text-xs text-[#8b949e]">.txt, .csv, .json, .tsv, .xml supported</span>
                        </div>
                    )}

                    {/* High-Performance 1-Node Gutter */}
                    <pre
                        ref={inputGutterRef}
                        aria-hidden="true"
                        className="w-11 min-w-[44px] bg-[#0d1117] border-r border-[#21262d] py-3 m-0 select-none overflow-hidden text-right pr-2 text-[#8b949e] font-mono text-xs leading-[1.6] pointer-events-none"
                    >
                        {inputLineGutter}
                    </pre>

                    {/* Textarea */}
                    <textarea
                        value={input}
                        onChange={e => onChangeInput(e.target.value)}
                        onScroll={e => {
                            if (inputGutterRef.current) {
                                inputGutterRef.current.scrollTop = (e.target as HTMLTextAreaElement).scrollTop
                            }
                        }}
                        placeholder={`Paste or drop your data here:\n\nusr_98a72b14\nusr_12c98d45, usr_44e12f88\n"another_item_1"; "another_item_2"`}
                        aria-label="Input raw data text area"
                        className={`flex-1 p-3 bg-transparent text-[#c9d1d9] placeholder-[#8b949e] font-mono text-xs leading-[1.6] resize-none outline-none ${wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre overflow-x-auto'}`}
                    />
                </div>
            </section>

            {/* Output Panel */}
            <section aria-label="Output formatted data section" className="flex flex-col bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-lg h-[440px]">
                {/* Header */}
                <div className="h-11 min-h-[44px] flex items-center justify-between px-3.5 bg-[#0d1117] border-b border-[#21262d] text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold uppercase tracking-wider text-[#8b949e] flex items-center gap-1.5 whitespace-nowrap text-xs">
                            <span className="w-2 h-2 rounded-full bg-[#58a6ff]" /> OUTPUT
                        </span>
                        {output && (
                            <div className="flex items-center gap-1.5 text-[11px] whitespace-nowrap">
                                <span
                                    className="px-2 py-0.5 bg-[#161b22] rounded border border-[#21262d] text-[#c9d1d9]"
                                    title={`${uniqueCount} unique item(s) detected`}
                                >
                                    {transformedCount} items
                                </span>
                                {duplicatesRemoved > 0 && (
                                    <span className="px-1.5 py-0.5 bg-[#f0883e]/15 text-[#f0883e] rounded border border-[#f0883e]/30 text-[10px]">
                                        -{duplicatesRemoved} dup
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            onClick={() => setWordWrap(!wordWrap)}
                            className={`h-7 px-2.5 py-1 rounded-md text-xs border transition-colors font-medium whitespace-nowrap ${wordWrap ? 'bg-[#21262d] text-white border-[#30363d]' : 'text-[#8b949e] border-transparent hover:text-white'}`}
                            title="Toggle word wrap"
                            aria-label="Toggle word wrap"
                        >
                            Wrap
                        </button>
                        <button
                            onClick={onSwap}
                            disabled={!output}
                            className="h-7 px-2.5 py-1 bg-[#161b22] hover:bg-[#21262d] disabled:opacity-40 disabled:cursor-not-allowed text-[#c9d1d9] hover:text-white border border-[#30363d] rounded-md text-xs transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
                            title="Swap: use formatted output as input"
                            aria-label="Swap output to input"
                        >
                            <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                            <span>Swap</span>
                        </button>
                        <button
                            onClick={() => handleDownload('txt')}
                            disabled={!output}
                            className="h-7 px-2.5 py-1 bg-[#161b22] hover:bg-[#21262d] disabled:opacity-40 disabled:cursor-not-allowed text-[#c9d1d9] hover:text-white border border-[#30363d] rounded-md text-xs transition-colors flex items-center gap-1.5 font-medium whitespace-nowrap"
                            title="Download output as file"
                            aria-label="Download output file"
                        >
                            <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Download</span>
                        </button>
                        <button
                            onClick={handleCopy}
                            disabled={!output}
                            className={`h-7 px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap ${copied
                                ? 'bg-[#238636] text-white'
                                : output
                                    ? 'bg-[#39d353] hover:bg-[#7ee787] text-[#0d1117] hover:scale-[1.02]'
                                    : 'bg-[#21262d] text-[#8b949e] cursor-not-allowed'
                                }`}
                            title={`Copy formatted output (${MODIFIER_KEY}+C or ${MODIFIER_KEY}+Enter)`}
                            aria-label="Copy formatted output"
                        >
                            {copied ? (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            )}
                            <span>{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                    </div>
                </div>

                {/* Output View with Line Numbers & Click-to-Copy */}
                <div
                    onClick={output ? handleCopy : undefined}
                    className={`relative flex-1 flex overflow-hidden bg-[#0d1117] group ${output ? 'cursor-pointer hover:bg-[#11161d] transition-colors' : ''}`}
                    title={output ? `Click anywhere to copy all formatted output (${MODIFIER_KEY}+C)` : undefined}
                >
                    {/* High-Performance 1-Node Gutter */}
                    <pre
                        ref={outputGutterRef}
                        aria-hidden="true"
                        className="w-11 min-w-[44px] bg-[#0d1117] border-r border-[#21262d] py-3 m-0 select-none overflow-hidden text-right pr-2 text-[#8b949e] font-mono text-xs leading-[1.6] pointer-events-none"
                    >
                        {outputLineGutter}
                    </pre>

                    {/* Pre tag for formatted result */}
                    <pre
                        onScroll={e => {
                            if (outputGutterRef.current) {
                                outputGutterRef.current.scrollTop = (e.target as HTMLElement).scrollTop
                            }
                        }}
                        aria-live="polite"
                        className={`flex-1 p-3 m-0 font-mono text-xs leading-[1.6] outline-none select-none ${output ? 'text-[#39d353]' : 'text-[#8b949e]'
                            } ${wordWrap ? 'whitespace-pre-wrap break-all overflow-y-auto' : 'whitespace-pre overflow-auto'}`}
                    >
                        {output || 'Formatted output will appear here instantly...'}
                    </pre>

                    {/* Floating Click-to-Copy Hint Badge */}
                    {output && (
                        <div
                            className={`absolute bottom-2.5 right-3 pointer-events-none transition-all duration-150 text-[11px] px-2.5 py-1 rounded-md border flex items-center gap-1.5 shadow-md font-mono ${copied
                                ? 'bg-[#238636] text-white border-[#2ea043] opacity-100 scale-100'
                                : 'bg-[#161b22]/90 backdrop-blur-xs text-[#8b949e] border-[#30363d] opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'
                                }`}
                        >
                            <svg className={`w-3 h-3 ${copied ? 'text-white' : 'text-[#39d353]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                {copied ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                )}
                            </svg>
                            <span>{copied ? 'Copied all!' : 'Click to copy all'}</span>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
