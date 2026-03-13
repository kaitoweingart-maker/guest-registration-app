// ISO 3166-1 alpha-3 to alpha-2 mapping (common countries)
const ALPHA3_TO_ALPHA2 = {
  AFG:'AF',ALB:'AL',DZA:'DZ',AND:'AD',AGO:'AO',ARG:'AR',ARM:'AM',AUS:'AU',
  AUT:'AT',AZE:'AZ',BHS:'BS',BHR:'BH',BGD:'BD',BRB:'BB',BLR:'BY',BEL:'BE',
  BLZ:'BZ',BEN:'BJ',BTN:'BT',BOL:'BO',BIH:'BA',BWA:'BW',BRA:'BR',BRN:'BN',
  BGR:'BG',BFA:'BF',BDI:'BI',KHM:'KH',CMR:'CM',CAN:'CA',CPV:'CV',CAF:'CF',
  TCD:'TD',CHL:'CL',CHN:'CN',COL:'CO',COG:'CG',COD:'CD',CRI:'CR',HRV:'HR',
  CUB:'CU',CYP:'CY',CZE:'CZ',DNK:'DK',DJI:'DJ',DMA:'DM',DOM:'DO',ECU:'EC',
  EGY:'EG',SLV:'SV',GNQ:'GQ',ERI:'ER',EST:'EE',SWZ:'SZ',ETH:'ET',FJI:'FJ',
  FIN:'FI',FRA:'FR',GAB:'GA',GMB:'GM',GEO:'GE',DEU:'DE',D:'DE',GHA:'GH',
  GRC:'GR',GTM:'GT',GIN:'GN',GNB:'GW',GUY:'GY',HTI:'HT',HND:'HN',HUN:'HU',
  ISL:'IS',IND:'IN',IDN:'ID',IRN:'IR',IRQ:'IQ',IRL:'IE',ISR:'IL',ITA:'IT',
  JAM:'JM',JPN:'JP',JOR:'JO',KAZ:'KZ',KEN:'KE',KWT:'KW',KGZ:'KG',LVA:'LV',
  LBN:'LB',LSO:'LS',LBR:'LR',LBY:'LY',LIE:'LI',LTU:'LT',LUX:'LU',MDG:'MG',
  MWI:'MW',MYS:'MY',MDV:'MV',MLI:'ML',MLT:'MT',MRT:'MR',MUS:'MU',MEX:'MX',
  MDA:'MD',MCO:'MC',MNG:'MN',MNE:'ME',MAR:'MA',MOZ:'MZ',MMR:'MM',NAM:'NA',
  NPL:'NP',NLD:'NL',NZL:'NZ',NIC:'NI',NER:'NE',NGA:'NG',MKD:'MK',NOR:'NO',
  OMN:'OM',PAK:'PK',PAN:'PA',PRY:'PY',PER:'PE',PHL:'PH',POL:'PL',PRT:'PT',
  QAT:'QA',ROU:'RO',RUS:'RU',RWA:'RW',SAU:'SA',SEN:'SN',SRB:'SR',SGP:'SG',
  SVK:'SK',SVN:'SI',SOM:'SO',ZAF:'ZA',SSD:'SS',ESP:'ES',LKA:'LK',SDN:'SD',
  SUR:'SR',SWE:'SE',CHE:'CH',SYR:'SY',TWN:'TW',TJK:'TJ',TZA:'TZ',THA:'TH',
  TLS:'TL',TGO:'TG',TTO:'TT',TUN:'TN',TUR:'TR',TKM:'TM',UGA:'UG',UKR:'UA',
  ARE:'AE',GBR:'GB',USA:'US',URY:'UY',UZB:'UZ',VEN:'VE',VNM:'VN',YEM:'YE',
  ZMB:'ZM',ZWE:'ZW',KOS:'XK',UNK:'XK',
};

function toAlpha2(code3) {
  if (!code3) return '';
  const upper = code3.replace(/</g, '').trim().toUpperCase();
  if (upper.length === 2) return upper;
  return ALPHA3_TO_ALPHA2[upper] || upper.substring(0, 2);
}

function cleanMrzText(text) {
  // MRZ uses only A-Z, 0-9, and < — fix common OCR mistakes
  return text
    .replace(/[^A-Z0-9<\n]/gi, '<')
    .toUpperCase();
}

function parseName(nameField) {
  const parts = nameField.split('<<').filter(Boolean);
  const lastName = (parts[0] || '').replace(/</g, ' ').trim();
  const firstName = (parts[1] || '').replace(/</g, ' ').trim();
  return { lastName, firstName };
}

function parseDOB(raw) {
  // YYMMDD → YYYY-MM-DD
  if (!raw || raw.length < 6) return '';
  const yy = parseInt(raw.substring(0, 2));
  const mm = raw.substring(2, 4);
  const dd = raw.substring(4, 6);
  const year = yy > 30 ? 1900 + yy : 2000 + yy;
  return `${year}-${mm}-${dd}`;
}

function parseSex(code) {
  if (code === 'M') return 'm';
  if (code === 'F') return 'w';
  return '';
}

// Parse TD3 format (Passport — 2 lines of 44 chars)
function parseTD3(line1, line2) {
  const { lastName, firstName } = parseName(line1.substring(5));
  const passportNo = line2.substring(0, 9).replace(/</g, '');
  const nationality = toAlpha2(line2.substring(10, 13));
  const dob = parseDOB(line2.substring(13, 19));
  const sex = parseSex(line2.substring(20, 21));

  return {
    familienname: lastName,
    vorname: firstName,
    geburtsdatum: dob,
    geschlecht: sex,
    nationalitaet: nationality,
    ausweis_nummer: passportNo,
    ausweistyp: 'PASS',
  };
}

// Parse TD1 format (ID Card — 3 lines of 30 chars)
function parseTD1(line1, line2, line3) {
  const docNo = line1.substring(5, 14).replace(/</g, '');
  const dob = parseDOB(line2.substring(0, 6));
  const sex = parseSex(line2.substring(7, 8));
  const nationality = toAlpha2(line2.substring(15, 18));
  const { lastName, firstName } = parseName(line3);

  return {
    familienname: lastName,
    vorname: firstName,
    geburtsdatum: dob,
    geschlecht: sex,
    nationalitaet: nationality,
    ausweis_nummer: docNo,
    ausweistyp: 'ID',
  };
}

export function parseMRZ(rawText) {
  const cleaned = cleanMrzText(rawText);
  const lines = cleaned.split('\n')
    .map(l => l.trim())
    .filter(l => l.length >= 28 && /^[A-Z0-9<]+$/.test(l));

  // Try TD3 (passport): 2 lines of ~44 chars
  const td3Lines = lines.filter(l => l.length >= 40 && l.length <= 48);
  if (td3Lines.length >= 2) {
    const l1 = td3Lines.find(l => l.startsWith('P'));
    const l2 = td3Lines.find(l => !l.startsWith('P') && /^[A-Z0-9]/.test(l));
    if (l1 && l2) {
      const padded1 = l1.padEnd(44, '<').substring(0, 44);
      const padded2 = l2.padEnd(44, '<').substring(0, 44);
      return parseTD3(padded1, padded2);
    }
  }

  // Try TD1 (ID card): 3 lines of ~30 chars
  const td1Lines = lines.filter(l => l.length >= 28 && l.length <= 34);
  if (td1Lines.length >= 3) {
    const padded = td1Lines.slice(0, 3).map(l => l.padEnd(30, '<').substring(0, 30));
    return parseTD1(padded[0], padded[1], padded[2]);
  }

  return null;
}
