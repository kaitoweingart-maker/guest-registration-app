import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
  { code: 'de', name: 'Deutsch' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'pl', name: 'Polski' },
  { code: 'cs', name: 'Čeština' },
  { code: 'hu', name: 'Magyar' },
  { code: 'ro', name: 'Română' },
  { code: 'hr', name: 'Hrvatski' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ar', name: 'العربية' },
  { code: 'tr', name: 'Türkçe' },
];

export default function LanguagePicker() {
  const { language, setLanguage } = useLanguage();

  if (language) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
        <h2 className="text-xl font-bold text-center text-brand-700 mb-2">
          Sprache wählen / Select Language
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Prize by Radisson Affoltern am Albis
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className="bg-brand-50 hover:bg-brand-100 text-brand-700 font-medium py-3 px-2 rounded-xl text-sm transition-colors border border-brand-200 hover:border-brand-400"
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
