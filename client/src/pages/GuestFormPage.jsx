import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitGuest } from '../api/client';
import Layout from '../components/Layout';

const NATIONALITIES = [
  'Schweiz', 'Deutschland', 'Österreich', 'Frankreich', 'Italien', 'Spanien',
  'Portugal', 'Niederlande', 'Belgien', 'Luxemburg', 'Grossbritannien',
  'Irland', 'Dänemark', 'Schweden', 'Norwegen', 'Finnland', 'Island',
  'Polen', 'Tschechien', 'Slowakei', 'Ungarn', 'Rumänien', 'Bulgarien',
  'Kroatien', 'Slowenien', 'Serbien', 'Bosnien und Herzegowina',
  'Nordmazedonien', 'Albanien', 'Montenegro', 'Kosovo', 'Griechenland',
  'Türkei', 'Russland', 'Ukraine', 'Belarus', 'Moldawien', 'Georgien',
  'Estland', 'Lettland', 'Litauen', 'USA', 'Kanada', 'Mexiko', 'Brasilien',
  'Argentinien', 'Chile', 'Kolumbien', 'China', 'Japan', 'Südkorea',
  'Indien', 'Thailand', 'Vietnam', 'Indonesien', 'Philippinen', 'Australien',
  'Neuseeland', 'Südafrika', 'Nigeria', 'Ägypten', 'Marokko', 'Israel',
  'Vereinigte Arabische Emirate', 'Saudi-Arabien', 'Andere'
];

const HOTELS = [
  'Amanthos Living Zurich Airport',
  'Amanthos Living Solothurn',
  'Amanthos Living Nyon',
  'Chalet Swiss Interlaken',
  'Amanthos Living Aarau',
  'Amanthos Living Luzern'
];

const INITIAL_FORM = {
  familienname: '', vorname: '', geburtsdatum: '', geschlecht: '',
  geburtsort: '', heimatort: '', nationalitaet: '', adresse: '', adresse2: '',
  plz: '', ort: '', land: '', landeskennzeichen: '', beruf: '',
  fz_kennzeichen: '', ausweistyp: '', ausweis_nummer: '', zimmer_nummer: '',
  personen_bis_16: '0', personen_ab_16: '1', ankunftsdatum: '', abreisedatum: '',
  mailadresse: '', newsletter: false, hotel: ''
};

export default function GuestFormPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.familienname.trim() || !form.vorname.trim()) {
      setError('Bitte Familienname und Vorname ausfüllen.');
      return;
    }
    if (!form.hotel) {
      setError('Bitte Hotel auswählen.');
      return;
    }

    setLoading(true);
    try {
      await submitGuest(form);
      navigate('/danke');
    } catch (err) {
      setError(err.message || 'Fehler beim Absenden');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-brand-700 mb-1">Gästeregistrierung</h2>
          <p className="text-sm text-gray-500 mb-6">Bitte füllen Sie alle Felder aus / Please fill in all fields</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hotel */}
            <div>
              <label className={labelClass}>Hotel *</label>
              <select name="hotel" value={form.hotel} onChange={handleChange} className={inputClass} required>
                <option value="">Bitte wählen...</option>
                {HOTELS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            {/* Zimmer */}
            <div>
              <label className={labelClass}>Zimmer-Nr. / Room No.</label>
              <input type="text" name="zimmer_nummer" value={form.zimmer_nummer} onChange={handleChange} className={inputClass} />
            </div>

            {/* Persönliche Daten */}
            <fieldset>
              <legend className="text-lg font-semibold text-brand-600 mb-3 border-b border-brand-100 pb-2">
                Persönliche Daten / Personal Data
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Familienname / Last Name *</label>
                  <input type="text" name="familienname" value={form.familienname} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Vorname / First Name *</label>
                  <input type="text" name="vorname" value={form.vorname} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Geburtsdatum / Date of Birth</label>
                  <input type="date" name="geburtsdatum" value={form.geburtsdatum} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Geschlecht / Gender</label>
                  <select name="geschlecht" value={form.geschlecht} onChange={handleChange} className={inputClass}>
                    <option value="">Bitte wählen...</option>
                    <option value="m">Männlich / Male</option>
                    <option value="w">Weiblich / Female</option>
                    <option value="divers">Divers / Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Geburtsort / Place of Birth</label>
                  <input type="text" name="geburtsort" value={form.geburtsort} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Heimatort / Place of Origin</label>
                  <input type="text" name="heimatort" value={form.heimatort} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Nationalität / Nationality</label>
                  <select name="nationalitaet" value={form.nationalitaet} onChange={handleChange} className={inputClass}>
                    <option value="">Bitte wählen...</option>
                    {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Beruf / Occupation</label>
                  <input type="text" name="beruf" value={form.beruf} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </fieldset>

            {/* Adresse */}
            <fieldset>
              <legend className="text-lg font-semibold text-brand-600 mb-3 border-b border-brand-100 pb-2">
                Adresse / Address
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Adresse / Address</label>
                  <input type="text" name="adresse" value={form.adresse} onChange={handleChange} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Adresse 2 / Address Line 2</label>
                  <input type="text" name="adresse2" value={form.adresse2} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>PLZ / Postal Code</label>
                  <input type="text" name="plz" value={form.plz} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Ort / City</label>
                  <input type="text" name="ort" value={form.ort} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Land / Country</label>
                  <input type="text" name="land" value={form.land} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Landeskennzeichen / Country Code</label>
                  <input type="text" name="landeskennzeichen" value={form.landeskennzeichen} onChange={handleChange} placeholder="z.B. CH, DE, AT" className={inputClass} />
                </div>
              </div>
            </fieldset>

            {/* Ausweis */}
            <fieldset>
              <legend className="text-lg font-semibold text-brand-600 mb-3 border-b border-brand-100 pb-2">
                Ausweisdaten / ID Information
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Ausweistyp / ID Type</label>
                  <select name="ausweistyp" value={form.ausweistyp} onChange={handleChange} className={inputClass}>
                    <option value="">Bitte wählen...</option>
                    <option value="ID">Identitätskarte / ID Card</option>
                    <option value="Pass">Reisepass / Passport</option>
                    <option value="Aufenthaltsbewilligung">Aufenthaltsbewilligung / Residence Permit</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Ausweis-Nr. / ID Number</label>
                  <input type="text" name="ausweis_nummer" value={form.ausweis_nummer} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>FZ-Kennzeichen / Vehicle Plate</label>
                  <input type="text" name="fz_kennzeichen" value={form.fz_kennzeichen} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </fieldset>

            {/* Aufenthalt */}
            <fieldset>
              <legend className="text-lg font-semibold text-brand-600 mb-3 border-b border-brand-100 pb-2">
                Aufenthalt / Stay
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Ankunftsdatum / Arrival Date</label>
                  <input type="date" name="ankunftsdatum" value={form.ankunftsdatum} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Abreisedatum / Departure Date</label>
                  <input type="date" name="abreisedatum" value={form.abreisedatum} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Personen bis 16 / Guests under 16</label>
                  <input type="number" name="personen_bis_16" min="0" value={form.personen_bis_16} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Personen ab 16 / Guests 16+</label>
                  <input type="number" name="personen_ab_16" min="1" value={form.personen_ab_16} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </fieldset>

            {/* Kontakt */}
            <fieldset>
              <legend className="text-lg font-semibold text-brand-600 mb-3 border-b border-brand-100 pb-2">
                Kontakt / Contact
              </legend>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>E-Mail</label>
                  <input type="email" name="mailadresse" value={form.mailadresse} onChange={handleChange} className={inputClass} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="newsletter" id="newsletter" checked={form.newsletter} onChange={handleChange} className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500" />
                  <label htmlFor="newsletter" className="text-sm text-gray-700">
                    Ich möchte den Newsletter erhalten / I would like to receive the newsletter
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
              {loading ? 'Wird gesendet...' : 'Registrierung absenden / Submit Registration'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
