// ISO 3166-1 alpha-2 country codes
export const COUNTRY_CODES = [
  'AF','AL','DZ','AD','AO','AG','AR','AM','AU','AT','AZ','BS','BH','BD','BB',
  'BY','BE','BZ','BJ','BT','BO','BA','BW','BR','BN','BG','BF','BI','KH','CM',
  'CA','CV','CF','TD','CL','CN','CO','KM','CG','CD','CR','HR','CU','CY','CZ',
  'DK','DJ','DM','DO','EC','EG','SV','GQ','ER','EE','SZ','ET','FJ','FI','FR',
  'GA','GM','GE','DE','GH','GR','GD','GT','GN','GW','GY','HT','HN','HU','IS',
  'IN','ID','IR','IQ','IE','IL','IT','JM','JP','JO','KZ','KE','KI','KP','KR',
  'XK','KW','KG','LA','LV','LB','LS','LR','LY','LI','LT','LU','MG','MW','MY',
  'MV','ML','MT','MH','MR','MU','MX','FM','MD','MC','MN','ME','MA','MZ','MM',
  'NA','NR','NP','NL','NZ','NI','NE','NG','MK','NO','OM','PK','PW','PS','PA',
  'PG','PY','PE','PH','PL','PT','QA','RO','RU','RW','KN','LC','VC','WS','SM',
  'ST','SA','SN','RS','SC','SL','SG','SK','SI','SB','SO','ZA','SS','ES','LK',
  'SD','SR','SE','CH','SY','TW','TJ','TZ','TH','TL','TG','TO','TT','TN','TR',
  'TM','TV','UG','UA','AE','GB','US','UY','UZ','VU','VA','VE','VN','YE','ZM','ZW'
];

// Locale mapping for Intl.DisplayNames
const LOCALE_MAP = {
  de: 'de', en: 'en', fr: 'fr', it: 'it', es: 'es', pt: 'pt',
  nl: 'nl', pl: 'pl', cs: 'cs', hu: 'hu', ro: 'ro', hr: 'hr',
  ru: 'ru', zh: 'zh', ja: 'ja', ko: 'ko', ar: 'ar', tr: 'tr',
};

export function getCountryOptions(lang = 'de') {
  const locale = LOCALE_MAP[lang] || 'de';
  let displayNames;
  try {
    displayNames = new Intl.DisplayNames([locale], { type: 'region' });
  } catch {
    displayNames = new Intl.DisplayNames(['de'], { type: 'region' });
  }

  return COUNTRY_CODES
    .map(code => {
      let name;
      try {
        name = displayNames.of(code);
      } catch {
        name = code;
      }
      return { code, name: name || code };
    })
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}
