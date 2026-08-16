import { useState, type FormEvent } from 'react'
import { type TransformConfig } from '../core/text-engine.js'
import { saveCustomPreset } from '../core/presets.js'
import { showToast } from '../core/toast.js'

interface SavePresetModalProps {
    isOpen: boolean
    onClose: () => void
    currentConfig: TransformConfig
    onSaved: (presetId: string) => void
}

export default function SavePresetModal({ isOpen, onClose, currentConfig, onSaved }: SavePresetModalProps) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    if (!isOpen) return null

    const handleSave = (e: FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        const saved = saveCustomPreset(name, currentConfig, '', description)
        showToast('Preset Saved!', `"${saved.name}" added to your local presets.`, 'success')
        onSaved(saved.id)
        setName('')
        setDescription('')
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div
                className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#21262d]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[#39d353]">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                        </div>
                        <h2 className="text-base font-semibold text-white">Save Custom Preset</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#8b949e] hover:text-white p-1 rounded-md transition-colors"
                        title="Close"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-[#8b949e] mb-1.5 font-medium">
                            Preset Name *
                        </label>
                        <input
                            type="text"
                            required
                            autoFocus
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. My Custom SQL Format"
                            className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] focus:border-[#39d353] rounded-lg text-sm text-[#c9d1d9] outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider text-[#8b949e] mb-1.5 font-medium">
                            Description (Optional)
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="e.g. Single quotes with comma and trim"
                            className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] focus:border-[#39d353] rounded-lg text-sm text-[#c9d1d9] outline-none transition-colors"
                        />
                    </div>

                    {/* Summary */}
                    <div className="p-3 bg-[#0d1117] border border-[#21262d] rounded-lg text-xs space-y-1 text-[#8b949e]">
                        <div className="font-semibold text-[#c9d1d9] mb-1">Configuration to be saved:</div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <span>Wrapper: <strong className="text-white">{currentConfig.wrapper}</strong></span>
                            <span>Delimiter: <strong className="text-white">{currentConfig.delimiter}</strong></span>
                            <span>Case: <strong className="text-white">{currentConfig.caseMode}</strong></span>
                            <span>Sort: <strong className="text-white">{currentConfig.sortMode || 'none'}</strong></span>
                            <span>Dedup: <strong className="text-white">{currentConfig.dedup ? 'Yes' : 'No'}</strong></span>
                            <span>Trim: <strong className="text-white">{currentConfig.trim ? 'Yes' : 'No'}</strong></span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium text-[#8b949e] hover:text-white bg-transparent border border-[#30363d] hover:border-[#8b949e] rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="px-4 py-2 text-xs font-semibold text-[#0d1117] bg-[#39d353] hover:bg-[#7ee787] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                        >
                            Save Preset
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
