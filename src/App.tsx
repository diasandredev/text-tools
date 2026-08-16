import { useState, useEffect, useCallback, useMemo, useDeferredValue } from 'react'
import Header from './components/Header'
import PresetPills from './components/PresetPills'
import ControlToolbar from './components/ControlToolbar'
import EditorPanel from './components/EditorPanel'
import SavePresetModal from './components/SavePresetModal'
import PresetManagerModal from './components/PresetManagerModal'
import ShortcutsModal from './components/ShortcutsModal'
import { ToastContainer } from './components/Toast'
import { showToast } from './core/toast.js'
import { MODIFIER_KEY } from './core/platform.js'

import {
  type TransformConfig,
  DEFAULT_CONFIG,
  parseInput,
  transformValues,
  joinValues
} from './core/text-engine'
import {
  type FormatterPreset,
  getSavedPreferences,
  savePreferences
} from './core/presets'

export default function App() {
  const savedPrefs = useMemo(() => getSavedPreferences(), [])

  // Input text is strictly in-memory (never written to localStorage for performance & privacy)
  const [input, setInput] = useState<string>('')
  const [config, setConfig] = useState<TransformConfig>(() => ({
    ...DEFAULT_CONFIG,
    ...(savedPrefs?.config || {})
  }))
  const [layout, setLayout] = useState<'split' | 'stacked'>(() => savedPrefs?.layout || 'split')
  const [activePresetId, setActivePresetId] = useState<string | undefined>(undefined)
  const [customPresetsVersion, setCustomPresetsVersion] = useState<number>(0)
  const [loadedFile, setLoadedFile] = useState<{ name: string; size: number } | null>(null)

  // Modals state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false)
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false)

  // React Concurrent Rendering: Defer transformation so typing stays 60fps even with 50k+ items
  const deferredInput = useDeferredValue(input)

  // Core parsing and transformations
  const parsed = useMemo(() => parseInput(deferredInput), [deferredInput])
  const transformed = useMemo(() => {
    return transformValues(
      parsed,
      config.wrapper,
      config.dedup,
      config.caseMode,
      config.trim,
      config.sortMode,
      config.customWrapperPrefix,
      config.customWrapperSuffix,
      config.regexFilter,
      config.regexFilterMode
    )
  }, [parsed, config])

  const output = useMemo(() => {
    return joinValues(
      transformed,
      config.delimiter,
      config.customDelimiter,
      config.enclosure,
      config.customEnclosureStart,
      config.customEnclosureEnd
    )
  }, [transformed, config])

  // Save ONLY lightweight user preferences (configs & layout) to localStorage
  useEffect(() => {
    savePreferences({ config, layout })
  }, [config, layout])

  const isDirty = useMemo(() => {
    return JSON.stringify(config) !== JSON.stringify(DEFAULT_CONFIG)
  }, [config])

  const handleSelectPreset = useCallback((preset: FormatterPreset) => {
    setConfig({ ...DEFAULT_CONFIG, ...preset.config })
    setActivePresetId(preset.id)
  }, [])

  const handleConfigChange = (newConfig: TransformConfig) => {
    setConfig(newConfig)
    setActivePresetId(undefined)
  }

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG)
    setActivePresetId(undefined)
    showToast('Settings Reset', 'Default values restored.', 'info')
  }

  const handleSwap = () => {
    if (!output) return
    setInput(output)
    setLoadedFile(null)
    showToast('Swapped!', 'Formatted output moved to input.', 'info')
  }

  const handleLoadedFile = useCallback((content: string, name: string, size: number) => {
    setInput(content)
    setLoadedFile({ name, size })
  }, [])

  const handleRemoveFile = useCallback(() => {
    setLoadedFile(null)
  }, [])

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

      // Escape to close modals
      if (e.key === 'Escape') {
        setIsSaveModalOpen(false)
        setIsManagerModalOpen(false)
        setIsShortcutsModalOpen(false)
        return
      }

      // Cmd/Ctrl + K => Open presets manager
      if (isCmdOrCtrl && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setIsManagerModalOpen(prev => !prev)
        return
      }

      // Cmd/Ctrl + S => Open save preset modal
      if (isCmdOrCtrl && (e.key === 's' || e.key === 'S')) {
        e.preventDefault()
        setIsSaveModalOpen(true)
        return
      }

      // Cmd/Ctrl + Enter => Copy output
      if (isCmdOrCtrl && e.key === 'Enter') {
        e.preventDefault()
        if (output) {
          navigator.clipboard.writeText(output)
          showToast('Copied to Clipboard!', `${transformed.length} items copied.`, 'success')
        }
        return
      }

      // Cmd/Ctrl + C when not focused on textarea
      if (isCmdOrCtrl && (e.key === 'c' || e.key === 'C') && document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'INPUT') {
        if (output) {
          navigator.clipboard.writeText(output)
          showToast('Copied to Clipboard!', `${transformed.length} items copied.`, 'success')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [output, transformed])

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] p-4 md:p-6 font-mono">
      <main className="max-w-6xl mx-auto">
        {/* Header */}
        <Header
          onOpenSaveModal={() => setIsSaveModalOpen(true)}
          onOpenManagerModal={() => setIsManagerModalOpen(true)}
          onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
          layout={layout}
          onChangeLayout={setLayout}
        />

        {/* Quick Presets Pills */}
        <PresetPills
          onSelectPreset={handleSelectPreset}
          activePresetId={activePresetId}
          customPresetsVersion={customPresetsVersion}
          onOpenManager={() => setIsManagerModalOpen(true)}
        />

        {/* Controls Toolbar */}
        <ControlToolbar
          config={config}
          onChangeConfig={handleConfigChange}
          onReset={handleReset}
          isDirty={isDirty}
        />

        {/* Editors */}
        <EditorPanel
          input={input}
          onChangeInput={setInput}
          output={output}
          parsedCount={parsed.length}
          uniqueCount={new Set(parsed).size}
          transformedCount={transformed.length}
          loadedFile={loadedFile}
          onLoadedFile={handleLoadedFile}
          onRemoveFile={handleRemoveFile}
          onSwap={handleSwap}
          layout={layout}
        />

        {/* Footer Hint */}
        <footer className="text-center text-xs text-[#8b949e] py-4 border-t border-[#21262d] flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-[#161b22] border border-[#30363d] rounded text-[#39d353]">{MODIFIER_KEY}+C</kbd> or <kbd className="px-1.5 py-0.5 bg-[#161b22] border border-[#30363d] rounded text-[#39d353]">{MODIFIER_KEY}+Enter</kbd> to copy • <kbd className="px-1.5 py-0.5 bg-[#161b22] border border-[#30363d] rounded text-[#39d353]">{MODIFIER_KEY}+K</kbd> for presets</span>
          <span>text-tools • Processed 100% locally in your browser</span>
        </footer>
      </main>

      {/* Modals & Toasts (Instant 0ms latency) */}
      <SavePresetModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        currentConfig={config}
        onSaved={id => {
          setActivePresetId(id)
          setCustomPresetsVersion(v => v + 1)
        }}
      />

      <PresetManagerModal
        isOpen={isManagerModalOpen}
        onClose={() => setIsManagerModalOpen(false)}
        onSelectPreset={handleSelectPreset}
        onPresetsChanged={() => setCustomPresetsVersion(v => v + 1)}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      <ToastContainer />
    </div>
  )
}
