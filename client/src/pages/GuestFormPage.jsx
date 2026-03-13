import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitGuest } from '../api/client';
import Layout from '../components/Layout';
import PhotoCapture from '../components/PhotoCapture';
import { useLanguage } from '../context/LanguageContext';
import { getCountryOptions } from '../data/countries';

const HOTEL_NAME = 'Prize by Radisson Affoltern am Albis';

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

const INITIAL_FORM = {
  familienname: '', vorname: '', geburtsdatum: '', geschlecht: '',
  geburtsort: '', heimatort: '', nationalitaet: '', adresse: '', adresse2: '',
  plz: '', ort: '', land: '', landeskennzeichen: '', beruf: '',
  fz_kennzeichen: '', ausweistyp: '', ausweis_nummer: '', zimmer_nummer: '',
  personen_bis_16: '0', personen_ab_16: '1', ankunftsdatum: todayISO(), abreisedatum: '',
  mailadresse: '', newsletter: true, hotel: HOTEL_NAME, id_photo: ''
};

const REQUIRED_FIELDS = [
  'familienname', 'vorname', 'geburtsdatum', 'adresse', 'plz', 'ort',
  'land', 'ausweistyp', 'ausweis_nummer'
];

export default function GuestFormPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const countryOptions = getCountryOptions(language || 'de');

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setForm(prev => ({ ...prev, [name]: newValue }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: false }));
    }
  }

  function handleCountryChange(e) {
    const code = e.target.value;
    setForm(prev => ({ ...prev, land: code, landeskennzeichen: code }));
    if (fieldErrors.land) {
      setFieldErrors(prev => ({ ...prev, land: false }));
    }
  }

  function handleOcrResult(data) {
    setForm(prev => {
      const updated = { ...prev };
      if (data.familienname && !prev.familienname) updated.familienname = data.familienname;
      if (data.vorname && !prev.vorname) updated.vorname = data.vorname;
      if (data.geburtsdatum && !prev.geburtsdatum) updated.geburtsdatum = data.geburtsdatum;
      if (data.geschlecht && !prev.geschlecht) updated.geschlecht = data.geschlecht;
      if (data.nationalitaet && !prev.nationalitaet) updated.nationalitaet = data.nationalitaet;
      if (data.ausweis_nummer && !prev.ausweis_nummer) updated.ausweis_nummer = data.ausweis_nummer;
      if (data.ausweistyp && !prev.ausweistyp) updated.ausweistyp = data.ausweistyp;
      return updated;
    });
    // Clear any field errors for auto-filled fields
    setFieldErrors({});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const errors = {};
    for (const field of REQUIRED_FIELDS) {
      if (!form[field] || !String(form[field]).trim()) {
        errors[field] = true;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(t('requiredFields'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      await submitGuest(form);
      navigate('/danke');
    } catch (err) {
      setError(err.message || t('submitError'));
    } finally {
      setLoading(false);
    }
  }

  const inputBase = 'w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent';
  const inputClass = (field) =>
    `${inputBase} ${fieldErrors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-brand-700 mb-1">{t('guestRegistration')}</h2>
          <p className="text-sm text-gray-500 mb-6">{t('subtitle')}</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* 1. PASSPORT PHOTO — first thing, prominent */}
            <fieldset>
              <legend className="text-lg font-semibold text-brand-600 mb-2 border-b border-brand-100 pb-2">
                {t('idPhoto')}
              </legend>
              <p className="text-xs text-gray-500 mb-3">{t('scanHint')}</p>
              <PhotoCapture
                value={form.id_photo}
                onChange={(val) => setForm(prev => ({ ...prev, id_photo: val || '' }))}
                onOcrResult={handleOcrResult}
                labels={{
                  idPhoto: t('idPhoto'),
                  takePhoto: t('takePhoto'),
                  uploadFile: t('uploadFile'),
                  photoTaken: t('photoTaken'),
                  removePhoto: t('removePhoto'),
                  scanning: t('scanning'),
                }}
              />
            </fieldset>

            {/* 2. Hotel + Room — quick info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('hotel')}</label>
                <input
                  type="text"
                  value={HOTEL_NAME}
                  readOnly
                  className={`${inputBase} border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed`}
                />
              </div>
              <div>
                <label className={labelClass}>{t('roomNumber')}</label>
                <input type="text" name="zimmer_nummer" value={form.zimmer_nummer} onChange={handleChange} className={inputClass('zimmer_nummer')} />
              </div>
            </div>

            {/* 3. Personal Data */}
            <fieldset>
              <legend className="text-lg font-semibold text-brand-600 mb-3 border-b border-brand-100 pb-2">
                {t('personalData')}
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('lastName')} *</label>
                  <input type="text" name="familienname" value={form.familienname} onChange={handleChange} className={inputClass('familienname')} />
                </div>
                <div>
                  <label className={labelClass}>{t('firstName')} *</label>
                  <input type="text" name="vorname" value={form.vorname} onChange={handleChange} className={inputClass('vorname')} />
                </div>
                <div>
                  <label className={labelClass}>{t('dateOfBirth')} *</label>
                  <input type="date" name="geburtsdatum" value={form.geburtsdatum} onChange={handleChange} className={inputClass('geburtsdatum')} />
                </div>
                <div>
                  <label className={labelClass}>{t('gender')}</label>
                  <select name="geschlecht" value={form.geschlecht} onChange={handleChange} className={inputClass('geschlecht')}>
                    <option value="">{t('pleaseSelect')}</option>
                    <option value="m">{t('male')}</option>
                    <option value="w">{t('female')}</option>
                    <option value="divers">{t('other')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('nationality')}</label>
                  <select name="nationalitaet" value={form.nationalitaet} onChange={handleChange} className={inputClass('nationalitaet')}>
                    <option value="">{t('pleaseSelect')}</option>
                    {countryOptions.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('placeOfBirth')}</label>
                  <input type="text" name="geburtsort" value={form.geburtsort} onChange={handleChange} className={inputClass('geburtsort')} />
                </div>
                <div>
                  <label className={labelClass}>{t('placeOfOrigin')}</label>
                  <input type="text" name="heimatort" value={form.heimatort} onChange={handleChange} className={inputClass('heimatort')} />
                </div>
                <div>
                  <label className={labelClass}>{t('occupation')}</label>
                  <input type="text" name="beruf" value={form.beruf} onChange={handleChange} className={inputClass('beruf')} />
                </div>
              </div>
            </fieldset>

            {/* 4. ID Information */}
            <fieldset>
              <legend className="text-lg font-semibold text-brand-600 mb-3 border-b border-brand-100 pb-2">
                {t('idInformation')}
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('idType')} *</label>
                  <select name="ausweistyp" value={form.ausweistyp} onChange={handleChange} className={inputClass('ausweistyp')}>
                    <option value="">{t('pleaseSelect')}</option>
                    <option value="PASS">{t('passport')}</option>
                    <option value="ID">{t('idCard')}</option>
                    <option value="AUTO">{t('driversLicense')}</option>
                    <option value="AUSW">{t('foreignId')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('idNumber')} *</label>
                  <input type="text" name="ausweis_nummer" value={form.ausweis_nummer} onChange={handleChange} className={inputClass('ausweis_nummer')} />
                </div>
                <div>
                  <label className={labelClass}>{t('vehiclePlate')}</label>
                  <input type="text" name="fz_kennzeichen" value={form.fz_kennzeichen} onChange={handleChange} className={inputClass('fz_kennzeichen')} />
                </div>
              </div>
            </fieldset>

            {/* 5. Address */}
            <fieldset>
              <legend className="text-lg font-semibold text-brand-600 mb-3 border-b border-brand-100 pb-2">
                {t('address')}
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>{t('address')} *</label>
                  <input type="text" name="adresse" value={form.adresse} onChange={handleChange} className={inputClass('adresse')} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>{t('addressLine2')}</label>
                  <input type="text" name="adresse2" value={form.adresse2} onChange={handleChange} className={inputClass('adresse2')} />
                </div>
                <div>
                  <label className={labelClass}>{t('postalCode')} *</label>
                  <input type="text" name="plz" value={form.plz} onChange={handleChange} className={inputClass('plz')} />
                </div>
                <div>
                  <label className={labelClass}>{t('city')} *</label>
                  <input type="text" name="ort" value={form.ort} onChange={handleChange} className={inputClass('ort')} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>{t('country')} *</label>
                  <select name="land" value={form.land} onChange={handleCountryChange} className={inputClass('land')}>
                    <option value="">{t('pleaseSelect')}</option>
                    {countryOptions.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </fieldset>

            {/* 6. Stay */}
            <fieldset>
              <legend className="text-lg font-semibold text-brand-600 mb-3 border-b border-brand-100 pb-2">
                {t('stay')}
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('arrivalDate')}</label>
                  <input type="date" name="ankunftsdatum" value={form.ankunftsdatum} onChange={handleChange} className={inputClass('ankunftsdatum')} />
                </div>
                <div>
                  <label className={labelClass}>{t('departureDate')}</label>
                  <input type="date" name="abreisedatum" value={form.abreisedatum} onChange={handleChange} className={inputClass('abreisedatum')} />
                </div>
                <div>
                  <label className={labelClass}>{t('guestsUnder16')}</label>
                  <input type="number" name="personen_bis_16" min="0" value={form.personen_bis_16} onChange={handleChange} className={inputClass('personen_bis_16')} />
                </div>
                <div>
                  <label className={labelClass}>{t('guests16Plus')}</label>
                  <input type="number" name="personen_ab_16" min="1" value={form.personen_ab_16} onChange={handleChange} className={inputClass('personen_ab_16')} />
                </div>
              </div>
            </fieldset>

            {/* 7. Contact */}
            <fieldset>
              <legend className="text-lg font-semibold text-brand-600 mb-3 border-b border-brand-100 pb-2">
                {t('contact')}
              </legend>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>{t('email')}</label>
                  <input type="email" name="mailadresse" value={form.mailadresse} onChange={handleChange} className={inputClass('mailadresse')} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="newsletter" id="newsletter" checked={form.newsletter} onChange={handleChange} className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500" />
                  <label htmlFor="newsletter" className="text-sm text-gray-700">
                    {t('newsletter')}
                  </label>
                </div>
              </div>
            </fieldset>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('submitting') : t('submit')}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
