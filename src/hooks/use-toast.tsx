import * as React from "react"

export interface ToastOptions {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export interface Toast extends ToastOptions {
  id: string
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (options: ToastOptions) => void
  dismiss: (toastId: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { id, ...options }
    
    setToasts((prevToasts) => [...prevToasts, newToast])

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const dismiss = React.useCallback((toastId: string) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== toastId))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg transition-all duration-300 ${
              toast.variant === "destructive"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-900 border border-gray-200"
            }`}
          >
            {toast.title && (
              <p className="font-semibold mb-1">{toast.title}</p>
            )}
            {toast.description && (
              <p className="text-sm opacity-90">{toast.description}</p>
            )}
            <button
              onClick={() => dismiss(toast.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}