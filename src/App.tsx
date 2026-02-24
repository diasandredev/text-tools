import { useState, useEffect } from 'react'

type Wrapper = "'" | '"' | '(' | 'none'
type Delimiter = ',' | ';' | 'NEWLINE' | '|' | 'custom'
type CaseMode = 'none' | 'upper' | 'lower'

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
  caseMode: CaseMode
): string[] {
  let result = [...values]
  
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
  let delim = delimiter === 'custom' ? customDelimiter : delimiter
  if (delim === 'NEWLINE') delim = '\n'
  return values.join(delim)
}

function App() {
  const [input, setInput] = useState('')
  const [wrapper, setWrapper] = useState<Wrapper>("'")
  const [delimiter, setDelimiter] = useState<Delimiter>(',')
  const [customDelimiter, setCustomDelimiter] = useState('')
  const [dedup, setDedup] = useState(true)
  const [caseMode, setCaseMode] = useState<CaseMode>('none')
  const [copied, setCopied] = useState(false)

  const parsed = parseInput(input)
  const transformed = transformValues(parsed, wrapper, dedup, caseMode)
  const output = joinValues(transformed, delimiter, customDelimiter)

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && output) {
        if (document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault()
          handleCopy()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [output, handleCopy])

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '20px', 
          fontWeight: 600,
          color: '#39d353'
        }}>
          Text-Tools
        </h1>
        <button
          onClick={handleCopy}
          disabled={!output}
          style={{
            backgroundColor: copied ? '#238636' : '#21262d',
            color: output ? '#c9d1d9' : '#484f58',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '13px'
          }}
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            color: '#8b949e',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Input
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste your raw data here (UUIDs, IDs, strings)..."
            style={{
              width: '100%',
              height: '280px',
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '6px',
              color: '#c9d1d9',
              padding: '12px',
              resize: 'vertical',
              outline: 'none'
            }}
            onFocus={e => e.target.style.borderColor = '#39d353'}
            onBlur={e => e.target.style.borderColor = '#30363d'}
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            color: '#8b949e',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Output Preview
          </label>
          <pre
            style={{
              width: '100%',
              height: '280px',
              backgroundColor: '#0d1117',
              border: '1px solid #30363d',
              borderRadius: '6px',
              color: '#39d353',
              padding: '12px',
              margin: 0,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}
          >
            {output || 'Output will appear here...'}
          </pre>
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#161b22', 
        border: '1px solid #30363d', 
        borderRadius: '6px',
        padding: '16px'
      }}>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '24px',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ color: '#8b949e', fontSize: '13px' }}>Wrapper:</label>
            <select
              value={wrapper}
              onChange={e => setWrapper(e.target.value as Wrapper)}
              style={{
                backgroundColor: '#21262d',
                color: '#c9d1d9',
                border: '1px solid #30363d',
                borderRadius: '4px',
                padding: '6px 10px',
                outline: 'none'
              }}
            >
              <option value="'">Single quotes '</option>
              <option value='"'>Double quotes "</option>
              <option value="(">Parentheses ( )</option>
              <option value="none">None</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ color: '#8b949e', fontSize: '13px' }}>Delimiter:</label>
            <select
              value={delimiter}
              onChange={e => setDelimiter(e.target.value as Delimiter)}
              style={{
                backgroundColor: '#21262d',
                color: '#c9d1d9',
                border: '1px solid #30363d',
                borderRadius: '4px',
                padding: '6px 10px',
                outline: 'none'
              }}
            >
              <option value=",">Comma ,</option>
              <option value=";">Semicolon ;</option>
              <option value="NEWLINE">Newline ↵</option>
              <option value="|">Pipe |</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {delimiter === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ color: '#8b949e', fontSize: '13px' }}>Custom:</label>
              <input
                type="text"
                value={customDelimiter}
                onChange={e => setCustomDelimiter(e.target.value)}
                placeholder="e.g., --sep"
                style={{
                  backgroundColor: '#21262d',
                  color: '#c9d1d9',
                  border: '1px solid #30363d',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  width: '100px',
                  outline: 'none'
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ color: '#8b949e', fontSize: '13px' }}>Case:</label>
            <select
              value={caseMode}
              onChange={e => setCaseMode(e.target.value as CaseMode)}
              style={{
                backgroundColor: '#21262d',
                color: '#c9d1d9',
                border: '1px solid #30363d',
                borderRadius: '4px',
                padding: '6px 10px',
                outline: 'none'
              }}
            >
              <option value="none">No change</option>
              <option value="upper">UPPERCASE</option>
              <option value="lower">lowercase</option>
            </select>
          </div>

          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            cursor: 'pointer',
            color: '#c9d1d9',
            fontSize: '13px'
          }}>
            <input
              type="checkbox"
              checked={dedup}
              onChange={e => setDedup(e.target.checked)}
              style={{ accentColor: '#39d353' }}
            />
            Deduplicate
          </label>
        </div>
      </div>

      <div style={{ 
        marginTop: '16px',
        color: '#8b949e',
        fontSize: '12px',
        display: 'flex',
        gap: '24px'
      }}>
        <span>Items: {parsed.length}</span>
        <span>Unique: {new Set(parsed).size}</span>
        <span>Output: {transformed.length} items</span>
      </div>
    </div>
  )
}

export default App
