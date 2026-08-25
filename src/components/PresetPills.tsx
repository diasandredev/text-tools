import { useMemo } from 'react'
import { type FormatterPreset, SYSTEM_PRESETS, getCustomPresets } from '../core/presets.js'
import { showToast } from '../core/toast.js'

interface PresetPillsProps {
    onSelectPreset: (preset: FormatterPreset) => void
    activePresetId?: string
    customPresetsVersion: number
    onOpenManager: () => void
}

export default function PresetPills({
    onSelectPreset,
    activePresetId,
    customPresetsVersion,
    onOpenManager
}: PresetPillsProps) {
    const customPresets = useMemo(() => {
        if (customPresetsVersion < 0) return []
        return getCustomPresets()
    }, [customPresetsVersion])
    const quickPresets = [...customPresets.slice(0, 3), ...SYSTEM_PRESETS.slice(0, 5)]

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8b949e] shrink-0 mr-1">
                Presets:
            </span>

            {quickPresets.map(preset => {
                const isActive = activePresetId === preset.id
                return (
                    <button
                        key={preset.id}
                        onClick={() => {
                            onSelectPreset(preset)
                            showToast('Preset Applied', `"${preset.name}" activated`, 'info')
                        }}
                        className={`h-7 px-3 text-xs rounded-lg border whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${isActive
                            ? 'bg-[#238636] border-[#39d353] text-white font-medium shadow-md shadow-[#238636]/20'
                            : 'bg-[#161b22] hover:bg-[#21262d] border-[#30363d] hover:border-[#8b949e] text-[#c9d1d9]'
                            }`}
                        title={preset.description || preset.name}
                    >
                        <span>{preset.name}</span>
                        {preset.isCustom && (
                            <span className="text-[9px] bg-[#238636]/30 text-[#39d353] px-1 py-0.2 rounded font-semibold">
                                custom
                            </span>
                        )}
                    </button>
                )
            })}

            <button
                onClick={onOpenManager}
                className="h-7 px-2.5 text-xs rounded-lg border border-dashed border-[#30363d] hover:border-[#8b949e] text-[#8b949e] hover:text-white bg-transparent transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 font-medium"
                title="Browse all presets"
            >
                <span>+ More</span>
            </button>
        </div>
    )
}
