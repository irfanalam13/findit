import { Navigate, useLocation } from 'react-router-dom';

import Navbar from '../components/Navbar';
import ReportAccess from '../components/ReportAccess';

export default function AuthPage() {
  const location = useLocation();
  const destination = location.state?.from?.pathname || '/';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-10">
        <ReportAccess>
          <Navigate to={destination} replace />
        </ReportAccess>
      </main>
    </div>
  );
}