export const isMac = typeof navigator !== 'undefined' && (
    /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent || '') ||
    (typeof navigator.platform === 'string' && navigator.platform.toUpperCase().indexOf('MAC') >= 0)
)

export const MODIFIER_KEY = isMac ? '⌘' : 'Ctrl'
export const MODIFIER_LABEL = isMac ? 'Cmd' : 'Ctrl'
