import { useState, useEffect } from 'react'
import { registerToastListener, type ToastMessage } from '../core/toast.js'

export function ToastContainer() {
    const [toasts, setToasts] = useState<ToastMessage[]>([])

    useEffect(() => {
        const unsubscribe = registerToastListener((newToast) => {
            setToasts((prev) => [...prev.slice(-3), newToast])
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== newToast.id))
            }, 3000)
        })

        return unsubscribe
    }, [])

    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => {
                const isSuccess = toast.type === 'success' || !toast.type
                const isWarning = toast.type === 'warning'
                const borderColor = isSuccess ? '#238636' : isWarning ? '#d29922' : '#388bfd'
                const icon = isSuccess ? '✓' : isWarning ? '⚠' : 'ℹ'
                const iconColor = isSuccess ? '#39d353' : isWarning ? '#e3b341' : '#58a6ff'

                return (
                    <div
                        key={toast.id}
                        className="animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-xs backdrop-blur-md"
                        style={{
                            backgroundColor: 'rgba(22, 27, 34, 0.95)',
                            border: `1px solid ${borderColor}`,
                            color: '#c9d1d9',
                            minWidth: '220px',
                            maxWidth: '340px'
                        }}
                    >
                        <span style={{ color: iconColor, fontWeight: 'bold', fontSize: '14px' }}>{icon}</span>
                        <div className="flex flex-col">
                            <span className="font-semibold text-white">{toast.title}</span>
                            {toast.description && (
                                <span className="text-[#8b949e] text-[11px] mt-0.5">{toast.description}</span>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
