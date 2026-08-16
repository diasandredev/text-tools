import { useState, useRef, type ChangeEvent } from 'react'
import {
    getCustomPresets,
    deleteCustomPreset,
    exportCustomPresetsJSON,
    importCustomPresetsJSON,
    SYSTEM_PRESETS,
    type FormatterPreset
} from '../core/presets.js'
import { showToast } from '../core/toast.js'

interface PresetManagerModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectPreset: (preset: FormatterPreset) => void
    onPresetsChanged: () => void
}

export default function PresetManagerModal({
    isOpen,
    onClose,
    onSelectPreset,
    onPresetsChanged
}: PresetManagerModalProps) {
    const [customPresets, setCustomPresets] = useState<FormatterPreset[]>(() => getCustomPresets())
    const [filter, setFilter] = useState<'all' | 'custom' | 'system'>('all')
    const fileInputRef = useRef<HTMLInputElement>(null)

    if (!isOpen) return null

    const refreshPresets = () => {
        setCustomPresets(getCustomPresets())
        onPresetsChanged()
    }

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete preset "${name}"?`)) {
            deleteCustomPreset(id)
            showToast('Preset Deleted', `"${name}" was removed from your LocalStorage.`, 'info')
            refreshPresets()
        }
    }

    const handleExport = () => {
        const json = exportCustomPresetsJSON()
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `text-tools-formatters-${new Date().toISOString().slice(0, 10)}.json`
        a.click()
        URL.revokeObjectURL(url)
        showToast('Export Completed', 'Presets downloaded as JSON.', 'success')
    }

    const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => {
            const content = reader.result as string
            const res = importCustomPresetsJSON(content)
            if (res.success) {
                showToast('Import Succeeded!', `${res.count} preset(s) imported.`, 'success')
                refreshPresets()
            } else {
                showToast('Import Failed', res.error || 'Invalid JSON file.', 'warning')
            }
        }
        reader.readAsText(file)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const displayedPresets = [
        ...(filter !== 'custom' ? SYSTEM_PRESETS : []),
        ...(filter !== 'system' ? customPresets : [])
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div
                className="w-full max-w-2xl bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#21262d]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[#c9d1d9]">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-white">Preset Manager</h2>
                            <p className="text-xs text-[#8b949e]">Browse, apply, or manage your custom formatters</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#8b949e] hover:text-white p-1 rounded-md transition-colors"
                        title="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Filter and Actions Bar */}
                <div className="flex flex-wrap items-center justify-between px-6 py-3 bg-[#0d1117] border-b border-[#21262d] gap-3">
                    <div className="flex items-center gap-1 bg-[#161b22] p-1 rounded-lg border border-[#30363d] text-xs">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 rounded-md transition-colors ${filter === 'all' ? 'bg-[#21262d] text-white font-medium shadow-xs' : 'text-[#8b949e] hover:text-white'}`}
                        >
                            All ({SYSTEM_PRESETS.length + customPresets.length})
                        </button>
                        <button
                            onClick={() => setFilter('custom')}
                            className={`px-3 py-1 rounded-md transition-colors ${filter === 'custom' ? 'bg-[#21262d] text-[#39d353] font-medium shadow-xs' : 'text-[#8b949e] hover:text-white'}`}
                        >
                            My Presets ({customPresets.length})
                        </button>
                        <button
                            onClick={() => setFilter('system')}
                            className={`px-3 py-1 rounded-md transition-colors ${filter === 'system' ? 'bg-[#21262d] text-white font-medium shadow-xs' : 'text-[#8b949e] hover:text-white'}`}
                        >
                            System ({SYSTEM_PRESETS.length})
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExport}
                            disabled={customPresets.length === 0}
                            className="h-7 px-3 text-xs text-[#8b949e] hover:text-white bg-[#161b22] hover:bg-[#21262d] disabled:opacity-40 disabled:cursor-not-allowed border border-[#30363d] rounded-lg transition-colors flex items-center gap-1.5"
                            title="Export presets to JSON"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>Export JSON</span>
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="h-7 px-3 text-xs text-[#8b949e] hover:text-white bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded-lg transition-colors flex items-center gap-1.5"
                            title="Import presets from JSON"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Import</span>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleImportFile}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="p-6 overflow-y-auto space-y-2.5 flex-1 select-none">
                    {displayedPresets.length === 0 ? (
                        <div className="text-center py-12 text-[#8b949e] text-sm">
                            <p>No custom presets found.</p>
                            <div className="text-xs text-[#484f58] mt-1">
                                Save configurations using the "Save Preset" button on the main screen.
                            </div>
                        </div>
                    ) : (
                        displayedPresets.map(preset => (
                            <div
                                key={preset.id}
                                className="flex items-center justify-between p-3 bg-[#0d1117] hover:bg-[#161b22] border border-[#30363d] hover:border-[#484f58] rounded-xl transition-colors group"
                            >
                                <div className="min-w-0 pr-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-xs text-white truncate font-mono">
                                            {preset.name}
                                        </span>
                                        {preset.isCustom ? (
                                            <span className="px-1.5 py-0.2 text-[10px] uppercase font-bold tracking-wider rounded bg-[#238636]/20 text-[#39d353] border border-[#238636]/40">
                                                Custom
                                            </span>
                                        ) : (
                                            <span className="px-1.5 py-0.2 text-[10px] uppercase font-bold tracking-wider rounded bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                                                Built-in
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-[#8b949e] truncate mt-0.5">
                                        {preset.description || (
                                            `Wrapper: ${preset.config.wrapper} | Delim: ${preset.config.delimiter} | Case: ${preset.config.caseMode}`
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => {
                                            onSelectPreset(preset)
                                            showToast('Preset Applied', `"${preset.name}" activated.`, 'info')
                                            onClose()
                                        }}
                                        className="h-7 px-3 text-xs font-semibold bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg transition-colors"
                                    >
                                        Apply
                                    </button>
                                    {preset.isCustom && (
                                        <button
                                            onClick={() => handleDelete(preset.id, preset.name)}
                                            className="h-7 w-7 flex items-center justify-center text-xs text-[#8b949e] hover:text-[#f85149] hover:bg-[#f85149]/10 rounded-lg transition-colors"
                                            title="Delete preset"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-[#0d1117] border-t border-[#21262d] flex justify-between items-center text-xs text-[#8b949e]">
                    <span>Custom presets are saved safely in your browser (LocalStorage).</span>
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
