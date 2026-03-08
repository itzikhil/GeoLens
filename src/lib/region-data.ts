export interface SubRegion {
  slug: string;
  name: string;
  countries: string[];
}

export interface RegionDef {
  slug: string;
  name: string;
  emoji: string;
  subregions: SubRegion[];
  countries: string[];
}

export const REGIONS: RegionDef[] = [
  {
    slug: 'europe',
    name: 'Europe',
    emoji: '🇪🇺',
    countries: ['France', 'Germany', 'UK', 'Poland', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Sweden', 'Norway', 'Finland', 'Denmark', 'Czech Republic', 'Romania', 'Hungary', 'Austria', 'Switzerland', 'Greece', 'Portugal', 'Ireland', 'Baltic States'],
    subregions: [
      { slug: 'western-europe', name: 'Western Europe', countries: ['France', 'Germany', 'UK', 'Netherlands', 'Belgium'] },
      { slug: 'eastern-europe', name: 'Eastern Europe', countries: ['Poland', 'Czech Republic', 'Romania', 'Hungary'] },
      { slug: 'nordic-baltic', name: 'Nordic & Baltic', countries: ['Sweden', 'Norway', 'Finland', 'Denmark', 'Baltic States'] },
      { slug: 'southern-europe', name: 'Southern Europe', countries: ['Italy', 'Spain', 'Greece', 'Portugal'] },
    ],
  },
  {
    slug: 'russia-eurasia',
    name: 'Russia / Eurasia',
    emoji: '🇷🇺',
    countries: ['Russia', 'Ukraine', 'Belarus', 'Moldova', 'Georgia', 'Armenia', 'Azerbaijan', 'Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Kyrgyzstan', 'Tajikistan'],
    subregions: [
      { slug: 'caucasus', name: 'Caucasus', countries: ['Georgia', 'Armenia', 'Azerbaijan'] },
      { slug: 'black-sea', name: 'Black Sea', countries: ['Ukraine', 'Russia', 'Georgia', 'Moldova'] },
      { slug: 'central-asia', name: 'Central Asia', countries: ['Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Kyrgyzstan', 'Tajikistan'] },
    ],
  },
  {
    slug: 'middle-east',
    name: 'Middle East',
    emoji: '🕌',
    countries: ['Iran', 'Iraq', 'Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Yemen', 'Syria', 'Lebanon', 'Jordan', 'Israel', 'Palestine', 'Turkey'],
    subregions: [
      { slug: 'gulf', name: 'Gulf', countries: ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'] },
      { slug: 'levant', name: 'Levant', countries: ['Syria', 'Lebanon', 'Jordan', 'Israel', 'Palestine'] },
      { slug: 'persian-gulf', name: 'Persian Gulf & Iran', countries: ['Iran', 'Iraq'] },
    ],
  },
  {
    slug: 'horn-of-africa',
    name: 'Horn of Africa',
    emoji: '🌍',
    countries: ['Ethiopia', 'Somalia', 'Eritrea', 'Djibouti', 'Kenya', 'Sudan', 'South Sudan'],
    subregions: [],
  },
  {
    slug: 'north-africa',
    name: 'North Africa',
    emoji: '🏜️',
    countries: ['Egypt', 'Libya', 'Tunisia', 'Algeria', 'Morocco'],
    subregions: [],
  },
  {
    slug: 'sub-saharan-africa',
    name: 'Sub-Saharan Africa',
    emoji: '🌍',
    countries: ['Nigeria', 'South Africa', 'DRC', 'Tanzania', 'Ghana', 'Cameroon', 'Mozambique', 'Angola'],
    subregions: [
      { slug: 'sahel', name: 'Sahel', countries: ['Mali', 'Niger', 'Burkina Faso', 'Chad', 'Mauritania'] },
      { slug: 'west-africa', name: 'West Africa', countries: ['Nigeria', 'Ghana', 'Senegal', 'Ivory Coast'] },
      { slug: 'east-africa', name: 'East Africa', countries: ['Tanzania', 'Uganda', 'Rwanda'] },
      { slug: 'southern-africa', name: 'Southern Africa', countries: ['South Africa', 'Mozambique', 'Angola'] },
    ],
  },
  {
    slug: 'south-asia',
    name: 'South Asia',
    emoji: '🇮🇳',
    countries: ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Afghanistan'],
    subregions: [],
  },
  {
    slug: 'east-asia',
    name: 'East Asia',
    emoji: '🇨🇳',
    countries: ['China', 'Japan', 'South Korea', 'North Korea', 'Taiwan', 'Mongolia'],
    subregions: [],
  },
  {
    slug: 'southeast-asia',
    name: 'Southeast Asia',
    emoji: '🌏',
    countries: ['Philippines', 'Vietnam', 'Indonesia', 'Thailand', 'Malaysia', 'Myanmar', 'Singapore', 'Cambodia', 'Laos'],
    subregions: [],
  },
  {
    slug: 'north-america',
    name: 'North America',
    emoji: '🇺🇸',
    countries: ['United States', 'Canada', 'Mexico'],
    subregions: [],
  },
  {
    slug: 'latin-america',
    name: 'Latin America',
    emoji: '🌎',
    countries: ['Brazil', 'Argentina', 'Colombia', 'Chile', 'Venezuela', 'Peru', 'Cuba', 'Ecuador'],
    subregions: [],
  },
  {
    slug: 'oceania',
    name: 'Oceania',
    emoji: '🇦🇺',
    countries: ['Australia', 'New Zealand', 'Papua New Guinea', 'Fiji'],
    subregions: [],
  },
  {
    slug: 'arctic-maritime',
    name: 'Arctic / Maritime',
    emoji: '🧊',
    countries: [],
    subregions: [],
  },
];

export function findRegionBySlug(slug: string): RegionDef | undefined {
  return REGIONS.find(r => r.slug === slug);
}

export function findRegionByName(name: string): RegionDef | undefined {
  return REGIONS.find(r => r.name === name || r.name.toLowerCase() === name.toLowerCase());
}

export function findSubregionBySlug(slug: string): { region: RegionDef; subregion: SubRegion } | undefined {
  for (const region of REGIONS) {
    const sub = region.subregions.find(s => s.slug === slug);
    if (sub) return { region, subregion: sub };
  }
  return undefined;
}

export function findCountryRegion(country: string): RegionDef | undefined {
  return REGIONS.find(r => r.countries.includes(country) || r.subregions.some(s => s.countries.includes(country)));
}

export function getAllCountries(): string[] {
  const set = new Set<string>();
  for (const r of REGIONS) {
    r.countries.forEach(c => set.add(c));
    r.subregions.forEach(s => s.countries.forEach(c => set.add(c)));
  }
  return Array.from(set).sort();
}
