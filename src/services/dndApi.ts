import type {
  ApiListResponse,
  ApiResourceRef,
  ArmorClassEntry,
  EquipmentDetail,
  MagicItemDetail,
  MonsterDetail,
} from '../types/dnd';

const BASE_URL = 'https://www.dnd5eapi.co/api';

const crListCache = new Map<string, ApiResourceRef[]>();
let equipmentListCache: ApiResourceRef[] | null = null;
let magicItemsListCache: ApiResourceRef[] | null = null;

const monsterDetailCache = new Map<string, MonsterDetail>();
const equipmentDetailCache = new Map<string, EquipmentDetail>();
const magicItemDetailCache = new Map<string, MagicItemDetail>();

async function fetchJson<T>(endpoint: string): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error al consultar la API (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function fetchMonsterList(challengeRatings?: string): Promise<ApiResourceRef[]> {
  const cacheKey = challengeRatings || 'all';
  const cached = crListCache.get(cacheKey);
  if (cached) return cached;

  const endpoint = challengeRatings
    ? `/monsters?challenge_rating=${challengeRatings}`
    : '/monsters';
  const data = await fetchJson<ApiListResponse>(endpoint);
  crListCache.set(cacheKey, data.results);
  return data.results;
}

export async function fetchMonsterDetail(index: string): Promise<MonsterDetail> {
  const cached = monsterDetailCache.get(index);
  if (cached) return cached;
  const detail = await fetchJson<MonsterDetail>(`/monsters/${index}`);
  monsterDetailCache.set(index, detail);
  return detail;
}

export function getCachedMonsterDetail(index: string): MonsterDetail | undefined {
  return monsterDetailCache.get(index);
}

export async function fetchMonstersBatch(
  indices: string[],
  concurrency = 6
): Promise<Map<string, MonsterDetail>> {
  const result = new Map<string, MonsterDetail>();
  const toFetch: string[] = [];

  for (const idx of indices) {
    const cached = monsterDetailCache.get(idx);
    if (cached) {
      result.set(idx, cached);
    } else {
      toFetch.push(idx);
    }
  }

  for (let i = 0; i < toFetch.length; i += concurrency) {
    const chunk = toFetch.slice(i, i + concurrency);
    const settled = await Promise.allSettled(
      chunk.map((idx) => fetchMonsterDetail(idx))
    );
    settled.forEach((res, idxOffset) => {
      if (res.status === 'fulfilled') {
        result.set(chunk[idxOffset], res.value);
      }
    });
  }

  return result;
}

export async function fetchEquipmentList(): Promise<ApiResourceRef[]> {
  if (equipmentListCache) return equipmentListCache;
  const data = await fetchJson<ApiListResponse>('/equipment');
  equipmentListCache = data.results;
  return equipmentListCache;
}

export async function fetchEquipmentDetail(index: string): Promise<EquipmentDetail> {
  const cached = equipmentDetailCache.get(index);
  if (cached) return cached;
  const detail = await fetchJson<EquipmentDetail>(`/equipment/${index}`);
  equipmentDetailCache.set(index, detail);
  return detail;
}

export async function fetchMagicItemsList(): Promise<ApiResourceRef[]> {
  if (magicItemsListCache) return magicItemsListCache;
  const data = await fetchJson<ApiListResponse>('/magic-items');
  magicItemsListCache = data.results;
  return magicItemsListCache;
}

export async function fetchMagicItemDetail(index: string): Promise<MagicItemDetail> {
  const cached = magicItemDetailCache.get(index);
  if (cached) return cached;
  const detail = await fetchJson<MagicItemDetail>(`/magic-items/${index}`);
  magicItemDetailCache.set(index, detail);
  return detail;
}

export function formatChallengeRating(cr: number): string {
  if (cr === 0.125) return '1/8';
  if (cr === 0.25) return '1/4';
  if (cr === 0.5) return '1/2';
  return String(cr);
}

export function getArmorClassValue(ac: ArmorClassEntry[] | number): number {
  if (typeof ac === 'number') return ac;
  if (Array.isArray(ac) && ac.length > 0) {
    return ac[0].value;
  }
  return 10;
}

export function getArmorClassLabel(ac: ArmorClassEntry[] | number): string {
  if (typeof ac === 'number') return `${ac}`;
  if (Array.isArray(ac) && ac.length > 0) {
    const primary = ac[0];
    return primary.type ? `${primary.value} (${primary.type})` : `${primary.value}`;
  }
  return '10';
}

export function formatAbilityModifier(score: number): string {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function translateSize(size: string): string {
  const map: Record<string, string> = {
    Tiny: 'Diminuto',
    Small: 'Pequeño',
    Medium: 'Mediano',
    Large: 'Grande',
    Huge: 'Enorme',
    Gargantuan: 'Gargantuesco',
  };
  return map[size] ?? size;
}

export function translateMonsterType(type: string): string {
  const map: Record<string, string> = {
    aberration: 'Aberración',
    beast: 'Bestia',
    celestial: 'Celestial',
    construct: 'Constructo',
    dragon: 'Dragón',
    elemental: 'Elemental',
    fey: 'Feérico',
    fiend: 'Infernal',
    giant: 'Gigante',
    humanoid: 'Humanoide',
    monstrosity: 'Monstruosidad',
    ooze: 'Cieno',
    plant: 'Planta',
    undead: 'No muerto',
  };
  return map[type.toLowerCase()] ?? type;
}

export function translateRarity(rarity: string): string {
  const map: Record<string, string> = {
    Common: 'Común',
    Uncommon: 'Poco común',
    Rare: 'Raro',
    'Very Rare': 'Muy raro',
    Legendary: 'Legendario',
    Artifact: 'Artefacto',
    Varies: 'Variable',
  };
  return map[rarity] ?? rarity;
}
