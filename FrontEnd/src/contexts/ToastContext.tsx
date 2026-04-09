import React, { createContext, useContext, ReactNode, useState } from 'react'

interface ToastData {
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextData {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData)

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastData | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}
      <style>{`
        .toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 1rem 1.5rem;
          border-radius: 4px;
          color: white;
          font-weight: 600;
          z-index: 1000;
        }
        .toast.success { background: #4caf50; }
        .toast.error { background: #f44336; }
        .toast.info { background: #2196f3; }
      `}</style>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
