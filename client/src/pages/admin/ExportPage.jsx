import { useState, useEffect } from 'react';
import { getGuests, exportCSV } from '../../api/client';
import Layout from '../../components/Layout';

const HOTEL = 'Prize by Radisson Affoltern am Albis';

export default function ExportPage() {
  const [guests, setGuests] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGuests();
  }, []);

  async function loadGuests() {
    setLoading(true);
    try {
      const params = { hotel: HOTEL };
      if (from) params.from = from;
      if (to) params.to = to;
      const data = await getGuests(params);
      setGuests(data);
    } catch {
      // handled by client
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    const params = { hotel: HOTEL };
    if (from) params.from = from;
    if (to) params.to = to;
    await exportCSV(params);
  }

  function handleFilter(e) {
    e.preventDefault();
    loadGuests();
  }

  return (
    <Layout showAdmin>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-brand-700 mb-4">Gäste-Export — {HOTEL}</h2>

        {/* Filter */}
        <form onSubmit={handleFilter} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Von / From</label>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bis / To</label>
              <input type="date" value={to} onChange={e => setTo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div className="flex gap-2">
              <button type="submit"
                className="bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors">
                Filtern
              </button>
              <button type="button" onClick={handleExport}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors">
                CSV Export (SiDAP)
              </button>
            </div>
          </div>
        </form>

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <span className="text-sm text-gray-600">
            {loading ? 'Laden...' : `${guests.length} Einträge gefunden`}
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-brand-50">
                <tr>
                  {['Zimmer', 'Familienname', 'Vorname', 'Nationalität', 'Land', 'Ankunft', 'Abreise', 'Foto', 'Erstellt'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-brand-700 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {guests.map(g => (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">{g.zimmer_nummer}</td>
                    <td className="px-3 py-2 whitespace-nowrap font-medium">{g.familienname}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{g.vorname}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{g.nationalitaet}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{g.land}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{g.ankunftsdatum}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{g.abreisedatum}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{g.id_photo ? 'Ja' : '-'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                      {new Date(g.created_at).toLocaleString('de-CH')}
                    </td>
                  </tr>
                ))}
                {guests.length === 0 && !loading && (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-gray-400">
                      Keine Einträge gefunden
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
