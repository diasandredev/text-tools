import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react'

const ACCEPTED_EXTENSIONS = ['.txt', '.csv', '.json', '.tsv', '.xml']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

interface FileUploadProps {
    onFileContent: (content: string, fileName: string, fileSize: number) => void
    hasFile: boolean
}

function getExtension(name: string): string {
    const idx = name.lastIndexOf('.')
    return idx >= 0 ? name.slice(idx).toLowerCase() : ''
}

function parseCsv(text: string): string {
    const lines = text.trim().split('\n')
    const values: string[] = []

    for (const line of lines) {
        const cells = line.match(/(".*?"|[^,]+)/g) || []
        for (const cell of cells) {
            const clean = cell.trim().replace(/^"|"$/g, '')
            if (clean) values.push(clean)
        }
    }

    return values.join('\n')
}

function parseTsv(text: string): string {
    const lines = text.trim().split('\n')
    const values: string[] = []

    for (const line of lines) {
        const cells = line.split('\t')
        for (const cell of cells) {
            const clean = cell.trim()
            if (clean) values.push(clean)
        }
    }

    return values.join('\n')
}

function parseJson(text: string): string {
    try {
        const data = JSON.parse(text)
        const values: string[] = []

        function extract(obj: unknown) {
            if (Array.isArray(obj)) {
                for (const item of obj) {
                    if (typeof item === 'object' && item !== null) {
                        extract(item)
                    } else {
                        values.push(String(item))
                    }
                }
            } else if (typeof obj === 'object' && obj !== null) {
                for (const val of Object.values(obj)) {
                    if (typeof val === 'object' && val !== null) {
                        extract(val)
                    } else {
                        values.push(String(val))
                    }
                }
            } else {
                values.push(String(obj))
            }
        }

        extract(data)
        return values.join('\n')
    } catch {
        return text
    }
}

function parseXml(text: string): string {
    try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(text, 'text/xml')
        const values: string[] = []

        function walk(node: Node) {
            if (node.nodeType === Node.TEXT_NODE) {
                const content = node.textContent?.trim()
                if (content) values.push(content)
            } else {
                node.childNodes.forEach(walk)
            }
        }

        walk(doc.documentElement)
        return values.join('\n')
    } catch {
        return text
    }
}

function processFile(text: string, extension: string): string {
    switch (extension) {
        case '.csv': return parseCsv(text)
        case '.tsv': return parseTsv(text)
        case '.json': return parseJson(text)
        case '.xml': return parseXml(text)
        default: return text
    }
}

export default function FileUpload({ onFileContent, hasFile }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const dragCounter = useRef(0)

    const handleFile = useCallback((file: File) => {
        setError(null)

        const ext = getExtension(file.name)
        if (!ACCEPTED_EXTENSIONS.includes(ext)) {
            setError(`Unsupported format "${ext}". Use: ${ACCEPTED_EXTENSIONS.join(', ')}`)
            return
        }

        if (file.size > MAX_FILE_SIZE) {
            setError('File too large. Max 5MB.')
            return
        }

        setLoading(true)
        const reader = new FileReader()
        reader.onload = () => {
            const text = reader.result as string
            const processed = processFile(text, ext)
            onFileContent(processed, file.name, file.size)
            setLoading(false)
        }
        reader.onerror = () => {
            setError('Error reading file.')
            setLoading(false)
        }
        reader.readAsText(file)
    }, [onFileContent])

    const handleDragEnter = (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        dragCounter.current++
        setIsDragging(true)
    }

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        dragCounter.current--
        if (dragCounter.current === 0) setIsDragging(false)
    }

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
        dragCounter.current = 0

        const file = e.dataTransfer.files?.[0]
        if (file) handleFile(file)
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
        if (inputRef.current) inputRef.current.value = ''
    }

    // Don't render the drop zone if a file is already loaded
    if (hasFile) return null

    return (
        <div>
            {/* Compact drop zone */}
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                style={{
                    border: `1px dashed ${isDragging ? '#39d353' : error ? '#f85149' : '#30363d'}`,
                    borderRadius: '6px',
                    padding: '8px 14px',
                    cursor: 'pointer',
                    backgroundColor: isDragging ? 'rgba(57, 211, 83, 0.05)' : 'transparent',
                    transition: 'all 0.2s ease',
                    animation: isDragging ? 'dropZonePulse 1.5s ease infinite' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '10px'
                }}
            >
                {loading ? (
                    <>
                        <div className="file-upload-spinner" />
                        <span style={{ color: '#8b949e', fontSize: '12px' }}>Processing...</span>
                    </>
                ) : (
                    <>
                        <span style={{ color: isDragging ? '#39d353' : '#484f58', fontSize: '13px', transition: 'color 0.2s ease' }}>
                            {isDragging ? '⬇' : '📁'}
                        </span>
                        <span style={{ color: isDragging ? '#39d353' : '#8b949e', fontSize: '12px', transition: 'color 0.2s ease' }}>
                            {isDragging ? 'Drop here' : 'Drop a file or click to browse'}
                        </span>
                        <span style={{ color: '#484f58', fontSize: '10px' }}>
                            .txt .csv .json .tsv .xml
                        </span>
                    </>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS.join(',')}
                onChange={handleInputChange}
                style={{ display: 'none' }}
            />

            {/* Error message */}
            {error && (
                <div style={{
                    color: '#f85149',
                    fontSize: '12px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    animation: 'fadeIn 0.2s ease'
                }}>
                    <span>⚠</span> {error}
                </div>
            )}
        </div>
    )
}
