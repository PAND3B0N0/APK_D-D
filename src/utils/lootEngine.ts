import {
  fetchEquipmentDetail,
  fetchEquipmentList,
  fetchMagicItemDetail,
  fetchMagicItemsList,
  translateRarity,
} from '../services/dndApi';
import type {
  ApiResourceRef,
  CoinPouch,
  GeneratedLoot,
  LootItem,
  LootMode,
} from '../types/dnd';

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

function rollDice(count: number, sides: number): number {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += rollDie(sides);
  }
  return total;
}

function pickRandomDistinct<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  const picked: T[] = [];
  const limit = Math.min(count, copy.length);
  for (let i = 0; i < limit; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    picked.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return picked;
}

export function generateCoinsForCR(cr: number, mode: LootMode): CoinPouch {
  const coins: CoinPouch = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
  const roll = rollDie(100);

  if (mode === 'individual') {
    if (cr <= 4) {
      if (roll <= 30) coins.cp = rollDice(5, 6);
      else if (roll <= 60) coins.sp = rollDice(4, 6);
      else if (roll <= 70) coins.ep = rollDice(3, 6);
      else if (roll <= 95) coins.gp = rollDice(3, 6);
      else coins.pp = rollDice(1, 6);
    } else if (cr <= 10) {
      if (roll <= 30) {
        coins.cp = rollDice(4, 6) * 100;
        coins.ep = rollDice(1, 6) * 10;
      } else if (roll <= 60) {
        coins.sp = rollDice(6, 6) * 10;
        coins.gp = rollDice(2, 6) * 10;
      } else if (roll <= 70) {
        coins.ep = rollDice(3, 6) * 10;
        coins.gp = rollDice(2, 6) * 10;
      } else if (roll <= 95) {
        coins.gp = rollDice(4, 6) * 10;
      } else {
        coins.gp = rollDice(2, 6) * 10;
        coins.pp = rollDice(3, 6);
      }
    } else if (cr <= 16) {
      if (roll <= 20) {
        coins.sp = rollDice(4, 6) * 100;
        coins.gp = rollDice(1, 6) * 100;
      } else if (roll <= 35) {
        coins.ep = rollDice(1, 6) * 100;
        coins.gp = rollDice(1, 6) * 100;
      } else if (roll <= 75) {
        coins.gp = rollDice(2, 6) * 100;
        coins.pp = rollDice(1, 6) * 10;
      } else {
        coins.gp = rollDice(2, 6) * 100;
        coins.pp = rollDice(2, 6) * 10;
      }
    } else {
      if (roll <= 15) {
        coins.ep = rollDice(2, 6) * 1000;
        coins.gp = rollDice(8, 6) * 100;
      } else if (roll <= 55) {
        coins.gp = rollDice(1, 6) * 1000;
        coins.pp = rollDice(1, 6) * 100;
      } else {
        coins.gp = rollDice(1, 6) * 1000;
        coins.pp = rollDice(2, 6) * 100;
      }
    }
  } else {
    // Hoard (Tesoro de guarida) scaled by CR tier
    if (cr <= 4) {
      coins.cp = rollDice(6, 6) * 100;
      coins.sp = rollDice(3, 6) * 100;
      coins.gp = rollDice(2, 6) * 10;
    } else if (cr <= 10) {
      coins.cp = rollDice(2, 6) * 100;
      coins.sp = rollDice(2, 6) * 1000;
      coins.gp = rollDice(6, 6) * 100;
      coins.pp = rollDice(3, 6) * 10;
    } else if (cr <= 16) {
      coins.gp = rollDice(4, 6) * 1000;
      coins.pp = rollDice(5, 6) * 100;
    } else {
      coins.gp = rollDice(12, 6) * 1000;
      coins.pp = rollDice(8, 6) * 1000;
    }
  }

  return coins;
}

export function calculateGoldEquivalent(coins: CoinPouch): number {
  const total =
    coins.cp * 0.01 +
    coins.sp * 0.1 +
    coins.ep * 0.5 +
    coins.gp +
    coins.pp * 10;
  return Math.round(total * 100) / 100;
}

function getAllowedRaritiesForCR(cr: number, mode: LootMode): string[] {
  if (cr <= 4) {
    return mode === 'hoard' ? ['Common', 'Uncommon'] : ['Common'];
  }
  if (cr <= 10) {
    return mode === 'hoard' ? ['Uncommon', 'Rare'] : ['Common', 'Uncommon'];
  }
  if (cr <= 16) {
    return mode === 'hoard' ? ['Rare', 'Very Rare'] : ['Uncommon', 'Rare'];
  }
  return mode === 'hoard'
    ? ['Rare', 'Very Rare', 'Legendary']
    : ['Rare', 'Very Rare'];
}

function getItemCountsForCR(
  cr: number,
  mode: LootMode
): { equipmentCount: number; magicCount: number } {
  if (mode === 'individual') {
    if (cr <= 4) return { equipmentCount: rollDie(2), magicCount: rollDie(100) > 85 ? 1 : 0 };
    if (cr <= 10) return { equipmentCount: rollDie(2), magicCount: rollDie(100) > 55 ? 1 : 0 };
    if (cr <= 16) return { equipmentCount: 1, magicCount: 1 };
    return { equipmentCount: 1, magicCount: rollDie(2) };
  }

  // Hoard
  if (cr <= 4) return { equipmentCount: 2 + rollDie(2), magicCount: 1 };
  if (cr <= 10) return { equipmentCount: 2 + rollDie(2), magicCount: 1 + (rollDie(100) > 50 ? 1 : 0) };
  if (cr <= 16) return { equipmentCount: 2, magicCount: 2 + (rollDie(100) > 60 ? 1 : 0) };
  return { equipmentCount: 2, magicCount: 3 };
}

async function sampleMagicItemsMatchingCR(
  list: ApiResourceRef[],
  targetCount: number,
  allowedRarities: string[]
): Promise<LootItem[]> {
  if (targetCount <= 0 || list.length === 0) return [];

  // Sample a pool of candidates to inspect their rarity from the API
  const candidateCount = Math.min(list.length, Math.max(targetCount * 5, 10));
  const candidates = pickRandomDistinct(list, candidateCount);
  const details = await Promise.allSettled(
    candidates.map((ref) => fetchMagicItemDetail(ref.index))
  );

  const matching: LootItem[] = [];
  const fallback: LootItem[] = [];

  for (const res of details) {
    if (res.status !== 'fulfilled') continue;
    const item = res.value;
    const rawRarity = item.rarity?.name ?? 'Common';
    const mapped: LootItem = {
      id: `magic-${item.index}-${Math.random().toString(36).slice(2, 7)}`,
      source: 'magic-item',
      name: item.name,
      category: item.equipment_category?.name ?? 'Objeto mágico',
      rarity: translateRarity(rawRarity),
      valueText: translateRarity(rawRarity),
      description:
        item.desc && item.desc.length > 0
          ? item.desc
          : ['Objeto mágico catalogado en el compendio de D&D 5e.'],
    };

    if (allowedRarities.includes(rawRarity)) {
      matching.push(mapped);
    } else {
      fallback.push(mapped);
    }
  }

  const chosen = matching.slice(0, targetCount);
  if (chosen.length < targetCount) {
    const needed = targetCount - chosen.length;
    chosen.push(...fallback.slice(0, needed));
  }
  return chosen;
}

async function sampleEquipmentItems(
  list: ApiResourceRef[],
  targetCount: number,
  cr: number
): Promise<LootItem[]> {
  if (targetCount <= 0 || list.length === 0) return [];

  // Pull a slightly larger pool so high CR favors costlier equipment (armor/weapons/gear)
  const poolSize = Math.min(list.length, Math.max(targetCount * 3, 6));
  const candidates = pickRandomDistinct(list, poolSize);
  const details = await Promise.allSettled(
    candidates.map((ref) => fetchEquipmentDetail(ref.index))
  );

  const parsed: Array<{ item: LootItem; costGp: number }> = [];
  for (const res of details) {
    if (res.status !== 'fulfilled') continue;
    const eq = res.value;
    const unit = eq.cost?.unit ?? 'gp';
    const qty = eq.cost?.quantity ?? 0;
    const mult =
      unit === 'pp' ? 10 : unit === 'gp' ? 1 : unit === 'ep' ? 0.5 : unit === 'sp' ? 0.1 : 0.01;
    const costGp = qty * mult;

    const extraInfo: string[] = [];
    if (eq.damage) {
      extraInfo.push(`Daño: ${eq.damage.damage_dice} ${eq.damage.damage_type?.name ?? ''}`);
    }
    if (eq.armor_class) {
      extraInfo.push(
        `CA base: ${eq.armor_class.base}${eq.armor_class.dex_bonus ? ' + DES' : ''}`
      );
    }
    const desc = [...extraInfo, ...(eq.desc ?? [])];

    parsed.push({
      costGp,
      item: {
        id: `eq-${eq.index}-${Math.random().toString(36).slice(2, 7)}`,
        source: 'equipment',
        name: eq.name,
        category: eq.equipment_category?.name ?? 'Equipo',
        rarity: 'Equipo estándar',
        valueText: qty > 0 ? `${qty} ${unit.toUpperCase()}` : 'Sin coste listado',
        description:
          desc.length > 0
            ? desc
            : ['Equipo estándar de aventurero consultado desde la API de D&D 5e.'],
        weight: eq.weight,
      },
    });
  }

  // Sort by cost relative to CR tier
  parsed.sort((a, b) => (cr >= 5 ? b.costGp - a.costGp : a.costGp - b.costGp));
  return parsed.slice(0, targetCount).map((p) => p.item);
}

export async function generateLootForCR(
  cr: number,
  mode: LootMode
): Promise<GeneratedLoot> {
  const [equipmentList, magicList] = await Promise.all([
    fetchEquipmentList(),
    fetchMagicItemsList(),
  ]);

  const coins = generateCoinsForCR(cr, mode);
  const totalGoldEquivalent = calculateGoldEquivalent(coins);
  const { equipmentCount, magicCount } = getItemCountsForCR(cr, mode);
  const allowedRarities = getAllowedRaritiesForCR(cr, mode);

  const [equipmentItems, magicItems] = await Promise.all([
    sampleEquipmentItems(equipmentList, equipmentCount, cr),
    sampleMagicItemsMatchingCR(magicList, magicCount, allowedRarities),
  ]);

  return {
    id: `loot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    challengeRating: cr,
    mode,
    coins,
    totalGoldEquivalent,
    items: [...magicItems, ...equipmentItems],
  };
}
