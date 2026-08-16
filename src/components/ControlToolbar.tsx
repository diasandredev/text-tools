import { useState } from 'react'
import {
    type Wrapper,
    type Delimiter,
    type CaseMode,
    type SortMode,
    type EnclosureMode,
    type TransformConfig
} from '../core/text-engine'

interface ControlToolbarProps {
    config: TransformConfig
    onChangeConfig: (newConfig: TransformConfig) => void
    onReset: () => void
    isDirty: boolean
}

export default function ControlToolbar({
    config,
    onChangeConfig,
    onReset,
    isDirty
}: ControlToolbarProps) {
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

    const update = (partial: Partial<TransformConfig>) => {
        onChangeConfig({ ...config, ...partial })
    }

    const wrapperOptions: { value: Wrapper; label: string }[] = [
        { value: "'", label: "Single ' '" },
        { value: '"', label: 'Double " "' },
        { value: '`', label: 'Backtick ` `' },
        { value: '(', label: 'Parens ( )' },
        { value: '[', label: 'Brackets [ ]' },
        { value: 'none', label: 'None' },
        { value: 'custom', label: 'Custom...' }
    ]

    const delimiterOptions: { value: Delimiter; label: string }[] = [
        { value: ',', label: 'Comma ,' },
        { value: ';', label: 'Semicolon ;' },
        { value: 'NEWLINE', label: 'Newline ↵' },
        { value: 'COMMA_NEWLINE', label: 'Comma + Newline' },
        { value: '|', label: 'Pipe |' },
        { value: 'TAB', label: 'Tab ⇥' },
        { value: 'SPACE', label: 'Space ␣' },
        { value: 'custom', label: 'Custom...' }
    ]

    const caseOptions: { value: CaseMode; label: string }[] = [
        { value: 'none', label: 'Original Case' },
        { value: 'upper', label: 'UPPERCASE' },
        { value: 'lower', label: 'lowercase' },
        { value: 'title', label: 'Title Case' },
        { value: 'camel', label: 'camelCase' },
        { value: 'snake', label: 'snake_case' },
        { value: 'kebab', label: 'kebab-case' },
        { value: 'pascal', label: 'PascalCase' }
    ]

    const sortOptions: { value: SortMode; label: string }[] = [
        { value: 'none', label: 'No Sorting' },
        { value: 'asc', label: 'A → Z (Alphabetical)' },
        { value: 'desc', label: 'Z → A (Descending)' },
        { value: 'length-asc', label: 'Length: Shortest First' },
        { value: 'length-desc', label: 'Length: Longest First' },
        { value: 'reverse', label: 'Reverse Order' },
        { value: 'shuffle', label: 'Shuffle Randomly' }
    ]

    const enclosureOptions: { value: EnclosureMode; label: string }[] = [
        { value: 'none', label: 'None' },
        { value: 'parens', label: 'Parens ( ... )' },
        { value: 'brackets', label: 'Brackets [ ... ]' },
        { value: 'braces', label: 'Braces { ... }' },
        { value: 'custom', label: 'Custom...' }
    ]

    const activeAdvancedCount = [
        config.caseMode !== 'none',
        Boolean(config.sortMode && config.sortMode !== 'none'),
        Boolean(config.regexFilter),
        Boolean(config.enclosure && config.enclosure !== 'none')
    ].filter(Boolean).length

    return (
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-3 shadow-md mb-6 transition-all">
            {/* Primary Clean Bar (Simple & Direct) */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Core Essential Controls */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Wrapper */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[#8b949e] uppercase text-[11px] font-semibold tracking-wider">
                            Wrap:
                        </span>
                        <select
                            value={config.wrapper}
                            onChange={e => update({ wrapper: e.target.value as Wrapper })}
                            className="px-2.5 py-1.5 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] hover:border-[#8b949e] rounded-lg text-xs text-[#c9d1d9] outline-none cursor-pointer min-w-[110px] transition-colors"
                        >
                            {wrapperOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Delimiter */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[#8b949e] uppercase text-[11px] font-semibold tracking-wider">
                            Delim:
                        </span>
                        <select
                            value={config.delimiter}
                            onChange={e => update({ delimiter: e.target.value as Delimiter })}
                            className="px-2.5 py-1.5 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] hover:border-[#8b949e] rounded-lg text-xs text-[#c9d1d9] outline-none cursor-pointer min-w-[125px] transition-colors"
                        >
                            {delimiterOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Quick Toggles */}
                    <div className="flex items-center gap-3 pl-2 border-l border-[#30363d]">
                        <label className="flex items-center gap-1.5 cursor-pointer text-[#c9d1d9] hover:text-white select-none text-xs">
                            <input
                                type="checkbox"
                                checked={config.dedup}
                                onChange={e => update({ dedup: e.target.checked })}
                                className="w-3.5 h-3.5 rounded bg-[#0d1117] border-[#30363d] text-[#238636] cursor-pointer accent-[#238636]"
                            />
                            <span>Dedup</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer text-[#c9d1d9] hover:text-white select-none text-xs">
                            <input
                                type="checkbox"
                                checked={config.trim}
                                onChange={e => update({ trim: e.target.checked })}
                                className="w-3.5 h-3.5 rounded bg-[#0d1117] border-[#30363d] text-[#238636] cursor-pointer accent-[#238636]"
                            />
                            <span>Trim</span>
                        </label>
                    </div>
                </div>

                {/* Right Side: Advanced Toggle & Reset */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                        className={`h-8 px-3 rounded-lg border text-xs font-medium transition-all flex items-center gap-2 ${isAdvancedOpen
                            ? 'bg-[#21262d] border-[#484f58] text-white shadow-xs'
                            : activeAdvancedCount > 0
                                ? 'bg-[#161b22] border-[#238636]/60 text-[#39d353] hover:border-[#39d353]'
                                : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-white hover:border-[#8b949e]'
                            }`}
                        title="Toggle advanced options (Case, Sort, Regex, Enclosure)"
                    >
                        <svg className="w-3.5 h-3.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        <span>More options</span>
                        {activeAdvancedCount > 0 && (
                            <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-[#238636]/30 text-[#39d353] border border-[#238636]/50 rounded-full">
                                {activeAdvancedCount}
                            </span>
                        )}
                        <svg
                            className={`w-3 h-3 text-[#8b949e] transition-transform duration-200 ${isAdvancedOpen ? 'rotate-180 text-white' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {isDirty && (
                        <button
                            onClick={onReset}
                            className="h-8 px-2.5 text-xs font-medium text-[#8b949e] hover:text-[#f0883e] bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] hover:border-[#f0883e]/50 rounded-lg transition-colors flex items-center gap-1.5"
                            title="Reset to default settings"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="hidden sm:inline">Reset</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Custom Inputs if selected in primary bar */}
            {(config.wrapper === 'custom' || config.delimiter === 'custom') && (
                <div className="flex flex-wrap gap-4 pt-3 mt-3 border-t border-[#21262d] text-xs">
                    {config.wrapper === 'custom' && (
                        <div className="flex items-center gap-2">
                            <span className="text-[#8b949e] font-medium">Custom Wrap:</span>
                            <input
                                type="text"
                                placeholder="Prefix (e.g. ')"
                                value={config.customWrapperPrefix || ''}
                                onChange={e => update({ customWrapperPrefix: e.target.value })}
                                className="w-24 px-2.5 py-1 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-md text-xs text-[#c9d1d9] outline-none transition-colors"
                            />
                            <input
                                type="text"
                                placeholder="Suffix (e.g. ')"
                                value={config.customWrapperSuffix || ''}
                                onChange={e => update({ customWrapperSuffix: e.target.value })}
                                className="w-24 px-2.5 py-1 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-md text-xs text-[#c9d1d9] outline-none transition-colors"
                            />
                        </div>
                    )}

                    {config.delimiter === 'custom' && (
                        <div className="flex items-center gap-2">
                            <span className="text-[#8b949e] font-medium">Custom Delim:</span>
                            <input
                                type="text"
                                placeholder="e.g. && or \t"
                                value={config.customDelimiter || ''}
                                onChange={e => update({ customDelimiter: e.target.value })}
                                className="w-32 px-2.5 py-1 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-md text-xs text-[#c9d1d9] outline-none transition-colors"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Expandable Advanced Options (Clean Drawer) */}
            {isAdvancedOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 mt-3 border-t border-[#21262d] text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* Capitalization */}
                    <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#8b949e] mb-1 font-semibold">
                            Case Conversion
                        </label>
                        <select
                            value={config.caseMode}
                            onChange={e => update({ caseMode: e.target.value as CaseMode })}
                            className="w-full px-2.5 py-1.5 bg-[#0d1117] border border-[#30363d] focus:border-[#39d353] rounded-lg text-xs text-[#c9d1d9] outline-none cursor-pointer"
                        >
                            {caseOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sorting */}
                    <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#8b949e] mb-1 font-semibold">
                            Sort Order
                        </label>
                        <select
                            value={config.sortMode || 'none'}
                            onChange={e => update({ sortMode: e.target.value as SortMode })}
                            className="w-full px-2.5 py-1.5 bg-[#0d1117] border border-[#30363d] focus:border-[#39d353] rounded-lg text-xs text-[#c9d1d9] outline-none cursor-pointer"
                        >
                            {sortOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Global Enclosure */}
                    <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#8b949e] mb-1 font-semibold">
                            Global Enclosure
                        </label>
                        <select
                            value={config.enclosure || 'none'}
                            onChange={e => update({ enclosure: e.target.value as EnclosureMode })}
                            className="w-full px-2.5 py-1.5 bg-[#0d1117] border border-[#30363d] focus:border-[#39d353] rounded-lg text-xs text-[#c9d1d9] outline-none cursor-pointer"
                        >
                            {enclosureOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>

                        {config.enclosure === 'custom' && (
                            <div className="flex gap-2 mt-2">
                                <input
                                    type="text"
                                    placeholder="Start (e.g. ()"
                                    value={config.customEnclosureStart || ''}
                                    onChange={e => update({ customEnclosureStart: e.target.value })}
                                    className="w-1/2 px-2 py-1 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#c9d1d9] outline-none focus:border-[#39d353]"
                                />
                                <input
                                    type="text"
                                    placeholder="End (e.g. ))"
                                    value={config.customEnclosureEnd || ''}
                                    onChange={e => update({ customEnclosureEnd: e.target.value })}
                                    className="w-1/2 px-2 py-1 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#c9d1d9] outline-none focus:border-[#39d353]"
                                />
                            </div>
                        )}
                    </div>

                    {/* Regex Filter */}
                    <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#8b949e] mb-1 font-semibold">
                            Regex / Filter Pattern
                        </label>
                        <div className="flex gap-1.5">
                            <input
                                type="text"
                                placeholder="e.g. ^usr_ or @gmail"
                                value={config.regexFilter || ''}
                                onChange={e => update({ regexFilter: e.target.value })}
                                className="flex-1 px-2.5 py-1.5 bg-[#0d1117] border border-[#30363d] focus:border-[#39d353] rounded-lg text-xs text-[#c9d1d9] outline-none"
                            />
                            {config.regexFilter && (
                                <select
                                    value={config.regexFilterMode || 'include'}
                                    onChange={e => update({ regexFilterMode: e.target.value as 'include' | 'exclude' })}
                                    className="px-2 py-1 bg-[#0d1117] border border-[#30363d] rounded-lg text-[11px] text-[#c9d1d9] outline-none cursor-pointer"
                                >
                                    <option value="include">Keep</option>
                                    <option value="exclude">Drop</option>
                                </select>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
