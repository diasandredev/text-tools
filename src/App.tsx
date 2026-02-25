import { useState, useEffect, useRef, useCallback } from 'react'
import FileUpload from './components/FileUpload'

type Wrapper = "'" | '"' | '(' | 'none'
type Delimiter = ',' | ';' | 'NEWLINE' | 'COMMA_NEWLINE' | '|' | 'custom'
type CaseMode = 'none' | 'upper' | 'lower'

const DEFAULT_WRAPPER: Wrapper = "'"
const DEFAULT_DELIMITER: Delimiter = ','
const DEFAULT_CASE: CaseMode = 'none'
const DEFAULT_DEDUP = true
const DEFAULT_TRIM = true

function parseInput(text: string): string[] {
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

function transformValues(
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

function joinValues(
  values: string[],
  delimiter: Delimiter,
  customDelimiter: string
): string {
  if (delimiter === 'NEWLINE') return values.join('\n')
  if (delimiter === 'COMMA_NEWLINE') return values.join(',\n')
  const delim = delimiter === 'custom' ? customDelimiter : delimiter
  return values.join(delim)
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '4px 0'
      }}
    >
      <div style={{
        width: '36px',
        height: '20px',
        borderRadius: '10px',
        backgroundColor: checked ? '#238636' : '#30363d',
        position: 'relative',
        transition: 'background-color 0.2s ease'
      }}>
        <div style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          position: 'absolute',
          top: '2px',
          left: checked ? '18px' : '2px',
          transition: 'left 0.2s ease'
        }} />
      </div>
      <span style={{ color: checked ? '#c9d1d9' : '#8b949e', fontSize: '13px' }}>
        {label}
      </span>
    </button>
  )
}

function Select({ value, onChange, options, label }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ color: '#8b949e', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            backgroundColor: '#21262d',
            color: '#c9d1d9',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '8px 32px 8px 12px',
            fontSize: '13px',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '140px',
            width: '100%'
          }}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {/* Custom chevron */}
        <div style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: '#8b949e',
          lineHeight: 1,
          fontSize: '10px'
        }}>
          ▾
        </div>
      </div>
    </div>
  )
}

function App() {
  const [input, setInput] = useState('')
  const [wrapper, setWrapper] = useState<Wrapper>(DEFAULT_WRAPPER)
  const [delimiter, setDelimiter] = useState<Delimiter>(DEFAULT_DELIMITER)
  const [customDelimiter, setCustomDelimiter] = useState('')
  const [dedup, setDedup] = useState(DEFAULT_DEDUP)
  const [trim, setTrim] = useState(DEFAULT_TRIM)
  const [caseMode, setCaseMode] = useState<CaseMode>(DEFAULT_CASE)
  const [copied, setCopied] = useState(false)
  const [loadedFile, setLoadedFile] = useState<{ name: string; size: number } | null>(null)
  const outputRef = useRef<HTMLPreElement>(null)

  const parsed = parseInput(input)
  const transformed = transformValues(parsed, wrapper, dedup, caseMode, trim)
  const output = joinValues(transformed, delimiter, customDelimiter)

  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setInput('')
    setWrapper(DEFAULT_WRAPPER)
    setDelimiter(DEFAULT_DELIMITER)
    setCustomDelimiter('')
    setDedup(DEFAULT_DEDUP)
    setTrim(DEFAULT_TRIM)
    setCaseMode(DEFAULT_CASE)
    setCopied(false)
    setLoadedFile(null)
  }

  const handleFileContent = useCallback((content: string, fileName: string, fileSize: number) => {
    setInput(content)
    setLoadedFile(fileName ? { name: fileName, size: fileSize } : null)
  }, [])

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleRemoveFile = () => {
    setInput('')
    setLoadedFile(null)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && output && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        if (output) {
          navigator.clipboard.writeText(output)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [output])

  const wrapperOptions = [
    { value: "'", label: "Single ' '" },
    { value: '"', label: 'Double " "' },
    { value: '(', label: 'Parens ( )' },
    { value: 'none', label: 'None' }
  ]

  const delimiterOptions = [
    { value: ',', label: 'Comma ,' },
    { value: ';', label: 'Semicolon ;' },
    { value: 'NEWLINE', label: 'Newline ↵' },
    { value: 'COMMA_NEWLINE', label: 'Comma + Newline' },
    { value: '|', label: 'Pipe |' },
    { value: 'custom', label: 'Custom...' }
  ]

  const caseOptions = [
    { value: 'none', label: 'No change' },
    { value: 'upper', label: 'UPPERCASE' },
    { value: 'lower', label: 'lowercase' }
  ]

  const isDirty = input !== '' ||
    wrapper !== DEFAULT_WRAPPER ||
    delimiter !== DEFAULT_DELIMITER ||
    dedup !== DEFAULT_DEDUP ||
    trim !== DEFAULT_TRIM ||
    caseMode !== DEFAULT_CASE

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0d1117',
      padding: '32px 24px',
      fontFamily: '"JetBrains Mono", "Fira Code", monospace'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#39d353', letterSpacing: '-0.5px' }}>
              text-tools
            </h1>
            <p style={{ margin: '4px 0 0', color: '#8b949e', fontSize: '13px' }}>
              Normalize, clean & format your data lists
            </p>
          </div>

        </header>

        {/* Main Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>

          {/* Input */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{
                color: '#8b949e',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Input
                {loadedFile && (
                  <span style={{ color: '#39d353', marginLeft: '8px', textTransform: 'none', letterSpacing: 'normal' }}>
                    — from file
                  </span>
                )}
              </label>
              {input && (
                <span style={{ color: '#484f58', fontSize: '11px' }}>
                  {parsed.length} item{parsed.length !== 1 ? 's' : ''} detected
                </span>
              )}
            </div>

            {loadedFile ? (
              /* File loaded — compact indicator only */
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#161b22',
                border: '1px solid #238636',
                borderRadius: '8px',
                padding: '14px 16px',
                animation: 'fadeIn 0.2s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>📄</span>
                  <div>
                    <div style={{ color: '#39d353', fontSize: '13px', fontWeight: 500 }}>{loadedFile.name}</div>
                    <div style={{ color: '#484f58', fontSize: '11px', marginTop: '2px' }}>{formatSize(loadedFile.size)}</div>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  style={{
                    background: 'transparent',
                    border: '1px solid #30363d',
                    color: '#8b949e',
                    cursor: 'pointer',
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    lineHeight: 1
                  }}
                  title="Remove file"
                  onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = '#f85149'; (e.target as HTMLButtonElement).style.color = '#f85149' }}
                  onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = '#30363d'; (e.target as HTMLButtonElement).style.color = '#8b949e' }}
                >
                  ✕ Remove
                </button>
              </div>
            ) : (
              /* No file — drop zone + textarea */
              <>
                <FileUpload onFileContent={handleFileContent} hasFile={false} />
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={`Paste your data here:\n\nuuid1, uuid2, uuid3\n"value1"; "value2"\nitem1\nitem2`}
                  style={{
                    width: '100%',
                    flex: 1,
                    minHeight: '280px',
                    backgroundColor: '#161b22',
                    border: '1px solid #30363d',
                    borderRadius: '8px',
                    color: '#c9d1d9',
                    padding: '16px',
                    resize: 'vertical',
                    outline: 'none',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#39d353'}
                  onBlur={e => e.target.style.borderColor = '#30363d'}
                />
              </>
            )}
          </div>

          {/* Output */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{
                color: '#8b949e',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Output Preview
              </label>
              {input && (
                <div style={{ display: 'flex', gap: '16px', color: '#8b949e', fontSize: '11px' }}>
                  <span>Items: <strong style={{ color: '#c9d1d9', fontWeight: 600 }}>{parsed.length}</strong></span>
                  <span>Unique: <strong style={{ color: '#c9d1d9', fontWeight: 600 }}>{new Set(parsed).size}</strong></span>
                  <span>Output: <strong style={{ color: transformed.length !== parsed.length ? '#f0883e' : '#c9d1d9', fontWeight: 600 }}>{transformed.length}</strong></span>
                </div>
              )}
            </div>
            <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <pre
                ref={outputRef}
                onClick={() => output && handleCopy()}
                style={{
                  width: '100%',
                  flex: 1,
                  minHeight: '280px',
                  backgroundColor: input ? '#0d1117' : '#161b22',
                  border: `1px solid ${input ? '#30363d' : '#21262d'}`,
                  borderRadius: '8px',
                  color: output ? '#39d353' : '#484f58',
                  padding: '16px',
                  margin: 0,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  cursor: output ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
              >
                {output || 'Your formatted output will appear here...'}
              </pre>

              {/* Copy Button Floating */}
              {output && (
                <button
                  onClick={handleCopy}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: copied ? '#238636' : '#21262d',
                    color: copied ? '#fff' : '#c9d1d9',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    opacity: 0.9
                  }}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <div style={{
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '10px',
          padding: '24px 32px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: '0'
          }}>

            {/* Format Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: '1', minWidth: '160px' }}>
              <span style={{ color: '#8b949e', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Format
              </span>
              <Select
                label="Wrapper"
                value={wrapper}
                onChange={v => setWrapper(v as Wrapper)}
                options={wrapperOptions}
              />
              <Select
                label="Delimiter"
                value={delimiter}
                onChange={v => setDelimiter(v as Delimiter)}
                options={delimiterOptions}
              />
              {delimiter === 'custom' && (
                <input
                  type="text"
                  value={customDelimiter}
                  onChange={e => setCustomDelimiter(e.target.value)}
                  placeholder="Custom delimiter..."
                  style={{
                    backgroundColor: '#21262d',
                    color: '#c9d1d9',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              )}
            </div>

            {/* Separator */}
            <div style={{ width: '1px', backgroundColor: '#30363d', margin: '0 24px', alignSelf: 'stretch' }} />

            {/* Transform Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: '1', minWidth: '160px' }}>
              <span style={{ color: '#8b949e', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Transform
              </span>
              <Select
                label="Case"
                value={caseMode}
                onChange={v => setCaseMode(v as CaseMode)}
                options={caseOptions}
              />
              <div style={{ paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Toggle
                  label="Deduplicate"
                  checked={dedup}
                  onChange={setDedup}
                />
                <Toggle
                  label="Trim spaces"
                  checked={trim}
                  onChange={setTrim}
                />
              </div>
            </div>

            {/* Separator */}
            <div style={{ width: '1px', backgroundColor: '#30363d', margin: '0 24px', alignSelf: 'stretch' }} />

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', flex: '1', minWidth: '140px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={handleCopy}
                  disabled={!output}
                  style={{
                    backgroundColor: copied ? '#238636' : '#39d353',
                    color: copied ? '#fff' : '#0d1117',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: output ? 'pointer' : 'not-allowed',
                    opacity: output ? 1 : 0.5,
                    transition: 'all 0.2s ease',
                    width: '100%'
                  }}
                >
                  {copied ? '✓ Copied!' : 'Copy Output'}
                </button>
                <button
                  onClick={handleReset}
                  disabled={!isDirty}
                  title="Reset all settings and input"
                  style={{
                    backgroundColor: 'transparent',
                    color: isDirty ? '#8b949e' : '#484f58',
                    border: `1px solid ${isDirty ? '#30363d' : '#21262d'}`,
                    borderRadius: '8px',
                    padding: '9px 20px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: isDirty ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                    width: '100%'
                  }}
                  onMouseEnter={e => { if (isDirty) (e.target as HTMLButtonElement).style.borderColor = '#f0883e'; (e.target as HTMLButtonElement).style.color = isDirty ? '#f0883e' : '#484f58' }}
                  onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = isDirty ? '#30363d' : '#21262d'; (e.target as HTMLButtonElement).style.color = isDirty ? '#8b949e' : '#484f58' }}
                >
                  ↺ Reset
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Footer hint */}
        <p style={{ textAlign: 'center', color: '#484f58', fontSize: '11px', marginTop: '24px' }}>
          Tip: Press ⌘C (or Ctrl+C) anywhere to copy the output
        </p>

      </div>
    </div>
  )
}

export default App
