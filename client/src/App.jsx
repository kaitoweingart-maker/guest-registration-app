import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import GuestFormPage from './pages/GuestFormPage';
import ThankYouPage from './pages/ThankYouPage';
import LoginPage from './pages/LoginPage';
import ExportPage from './pages/admin/ExportPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<GuestFormPage />} />
          <Route path="/danke" element={<ThankYouPage />} />
          <Route path="/admin" element={<LoginPage />} />
          <Route path="/admin/export" element={
            <ProtectedRoute>
              <ExportPage />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
