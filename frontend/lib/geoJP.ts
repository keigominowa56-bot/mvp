export type Prefecture = { code: string; name: string; cities: string[] };

let cache: Prefecture[] | null = null;

export async function loadPrefCityData(): Promise<Prefecture[]> {
  if (cache) return cache;
  const res = await fetch('/geo/jp-pref-cities.json', { cache: 'force-cache' });
  if (!res.ok) throw new Error('Failed to load prefecture data');
  cache = (await res.json()) as Prefecture[];
  return cache!;
}

export async function getPrefectureNames(): Promise<string[]> {
  const list = await loadPrefCityData();
  return list.map((p) => p.name);
}

export async function getCitiesByPrefName(prefName: string): Promise<string[]> {
  const list = await loadPrefCityData();
  const pref = list.find((p) => p.name === prefName);
  return pref ? pref.cities : [];
}