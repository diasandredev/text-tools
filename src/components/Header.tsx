
import { MODIFIER_KEY } from '../core/platform'

interface HeaderProps {
    onOpenSaveModal: () => void
    onOpenManagerModal: () => void
    onOpenShortcutsModal: () => void
    layout: 'split' | 'stacked'
    onChangeLayout: (layout: 'split' | 'stacked') => void
}

export default function Header({
    onOpenSaveModal,
    onOpenManagerModal,
    onOpenShortcutsModal,
    layout,
    onChangeLayout
}: HeaderProps) {
    return (
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#21262d] mb-4">
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-[#39d353] tracking-tight font-mono">
                        text-tools
                    </h1>
                    <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-[#161b22] text-[#8b949e] border border-[#30363d] rounded-md">
                        v2.0
                    </span>
                </div>
                <p className="text-xs text-[#8b949e] mt-0.5">
                    Normalize, clean & format data lists fast
                </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center flex-wrap gap-2">
                {/* Layout Mode Toggle */}
                <div className="flex items-center bg-[#161b22] border border-[#30363d] rounded-lg p-0.5 text-xs">
                    <button
                        onClick={() => onChangeLayout('split')}
                        className={`h-7 px-2.5 rounded-md flex items-center gap-1.5 transition-colors ${layout === 'split' ? 'bg-[#21262d] text-white font-medium shadow-xs' : 'text-[#8b949e] hover:text-white'}`}
                        title="Split View (50/50)"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <line x1="12" y1="3" x2="12" y2="21" />
                        </svg>
                        <span className="hidden sm:inline">Split</span>
                    </button>
                    <button
                        onClick={() => onChangeLayout('stacked')}
                        className={`h-7 px-2.5 rounded-md flex items-center gap-1.5 transition-colors ${layout === 'stacked' ? 'bg-[#21262d] text-white font-medium shadow-xs' : 'text-[#8b949e] hover:text-white'}`}
                        title="Stacked View"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                        </svg>
                        <span className="hidden sm:inline">Stack</span>
                    </button>
                </div>

                {/* Presets Manager Button */}
                <button
                    onClick={onOpenManagerModal}
                    className="h-8 px-3 text-xs font-medium text-[#c9d1d9] bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] hover:border-[#8b949e] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    title={`Open Formatter Presets (${MODIFIER_KEY}+K)`}
                >
                    <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Presets</span>
                </button>

                {/* Save Current as Preset */}
                <button
                    onClick={onOpenSaveModal}
                    className="h-8 px-3 text-xs font-medium text-[#39d353] hover:text-[#7ee787] bg-[#238636]/10 hover:bg-[#238636]/20 border border-[#238636]/40 hover:border-[#39d353] rounded-lg transition-all flex items-center gap-1.5 shadow-xs"
                    title="Save current config to LocalStorage"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    <span>Save Preset</span>
                </button>

                {/* Keyboard Shortcuts Trigger */}
                <button
                    onClick={onOpenShortcutsModal}
                    className="h-8 w-8 flex items-center justify-center text-xs text-[#8b949e] hover:text-white bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded-lg transition-colors"
                    title="Keyboard Shortcuts"
                    aria-label="View keyboard shortcuts"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10" />
                    </svg>
                </button>
            </div>
        </header>
    )
}
