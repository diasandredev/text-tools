
import { MODIFIER_KEY } from '../core/platform.js'

interface ShortcutsModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
    if (!isOpen) return null

    const shortcuts = [
        { key: `${MODIFIER_KEY} + C`, description: 'Copy formatted output (unfocused)' },
        { key: `${MODIFIER_KEY} + Enter`, description: 'Instantly copy formatted output' },
        { key: `${MODIFIER_KEY} + Shift + V`, description: 'Paste clipboard & auto-format' },
        { key: `${MODIFIER_KEY} + K`, description: 'Open Presets Manager' },
        { key: `${MODIFIER_KEY} + S`, description: 'Save configuration as Preset' },
        { key: 'Esc', description: 'Close active modal' }
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div
                className="w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#21262d]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[#c9d1d9]">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-white">Keyboard Shortcuts</h2>
                            <p className="text-xs text-[#8b949e]">Fast controls and navigation</p>
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

                <div className="p-6 space-y-1">
                    {shortcuts.map((s, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between gap-4 py-2.5 px-3 rounded-lg hover:bg-[#0d1117]/50 border-b border-[#21262d]/60 last:border-none transition-colors"
                        >
                            <span className="text-xs text-[#c9d1d9] font-sans">{s.description}</span>
                            <kbd className="px-2.5 py-1 bg-[#0d1117] border border-[#30363d] rounded-md text-xs font-mono text-[#39d353] shadow-xs shrink-0 whitespace-nowrap text-center">
                                {s.key}
                            </kbd>
                        </div>
                    ))}
                </div>

                <div className="px-6 py-3 bg-[#0d1117] border-t border-[#21262d] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-white text-xs rounded-lg transition-colors font-medium"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    )
}
