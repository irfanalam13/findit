
import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={10}
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#18181b',
          color: '#ffffff',
          padding: '14px 16px',
          fontSize: '14px',
          maxWidth: '420px',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#16a34a',
            secondary: '#ffffff',
          },
        },
        error: {
          duration: 4500,
          iconTheme: {
            primary: '#dc2626',
            secondary: '#ffffff',
          },
        },
      }}
    />
  )
}
