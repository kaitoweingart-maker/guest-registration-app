import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function ThankYouPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-brand-700 mb-2">Vielen Dank!</h2>
          <p className="text-gray-600 mb-2">Ihre Registrierung wurde erfolgreich übermittelt.</p>
          <p className="text-gray-500 text-sm mb-6">Thank you! Your registration has been submitted successfully.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
          >
            Neue Registrierung / New Registration
          </button>
        </div>
      </div>
    </Layout>
  );
}
