export interface ToastMessage {
    id: string
    title: string
    description?: string
    type?: 'success' | 'info' | 'warning'
}

type ToastListener = (toast: ToastMessage) => void

let toastListener: ToastListener | null = null

export function registerToastListener(listener: ToastListener): () => void {
    toastListener = listener
    return () => {
        toastListener = null
    }
}

export function showToast(
    title: string,
    description?: string,
    type: 'success' | 'info' | 'warning' = 'success'
): void {
    if (toastListener) {
        toastListener({
            id: Math.random().toString(36).substring(2, 9),
            title,
            description,
            type
        })
    }
}
