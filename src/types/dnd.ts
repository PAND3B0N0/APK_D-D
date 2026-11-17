export type ModuleTab = 'bestiary' | 'loot' | 'dice';

export interface ApiResourceRef {
  index: string;
  name: string;
  url: string;
}

export interface ApiListResponse {
  count: number;
  results: ApiResourceRef[];
}

export interface ArmorClassEntry {
  type: string;
  value: number;
  desc?: string;
}

export interface MonsterProficiency {
  value: number;
  proficiency: ApiResourceRef;
}

export interface MonsterAbility {
  name: string;
  desc: string;
  attack_bonus?: number;
}

export interface MonsterDetail {
  index: string;
  name: string;
  size: string;
  type: string;
  subtype?: string;
  alignment: string;
  armor_class: ArmorClassEntry[] | number;
  hit_points: number;
  hit_dice: string;
  hit_points_roll?: string;
  speed: Record<string, string>;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  proficiencies?: MonsterProficiency[];
  damage_vulnerabilities?: string[];
  damage_resistances?: string[];
  damage_immunities?: string[];
  condition_immunities?: ApiResourceRef[];
  senses?: Record<string, string | number>;
  languages?: string;
  challenge_rating: number;
  xp?: number;
  special_abilities?: MonsterAbility[];
  actions?: MonsterAbility[];
  legendary_actions?: MonsterAbility[];
}

export interface EquipmentDetail {
  index: string;
  name: string;
  equipment_category?: ApiResourceRef;
  gear_category?: ApiResourceRef;
  weapon_category?: string;
  armor_category?: string;
  cost?: {
    quantity: number;
    unit: string;
  };
  weight?: number;
  desc?: string[];
  damage?: {
    damage_dice: string;
    damage_type?: ApiResourceRef;
  };
  armor_class?: {
    base: number;
    dex_bonus: boolean;
    max_bonus?: number;
  };
  properties?: ApiResourceRef[];
}

export interface MagicItemDetail {
  index: string;
  name: string;
  equipment_category?: ApiResourceRef;
  rarity?: {
    name: string;
  };
  desc?: string[];
  variant?: boolean;
}

export type LootMode = 'individual' | 'hoard';

export interface CoinPouch {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

export interface LootItem {
  id: string;
  source: 'equipment' | 'magic-item';
  name: string;
  category: string;
  rarity: string;
  valueText: string;
  description: string[];
  weight?: number;
}

export interface GeneratedLoot {
  id: string;
  timestamp: number;
  challengeRating: number;
  mode: LootMode;
  coins: CoinPouch;
  totalGoldEquivalent: number;
  items: LootItem[];
}

export type DiceSides = 4 | 6 | 8 | 10 | 12 | 20 | 100;

export type RollMode = 'normal' | 'advantage' | 'disadvantage';

export interface RollRecord {
  id: string;
  timestamp: number;
  sides: DiceSides;
  count: number;
  modifier: number;
  mode: RollMode;
  rolls: number[];
  keptRoll?: number;
  droppedRoll?: number;
  subtotal: number;
  total: number;
  isCrit: boolean;
  isFumble: boolean;
}
