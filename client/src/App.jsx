
import HomePage from './pages/HomePage'
import ToastProvider from './components/ToastProvider'
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider />
      <HomePage />
    </AuthProvider>
  )
}
