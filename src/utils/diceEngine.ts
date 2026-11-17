import type { DiceSides, RollMode, RollRecord } from '../types/dnd';

export const STANDARD_DICE: Array<{
  sides: DiceSides;
  label: string;
  shapeName: string;
}> = [
  { sides: 4, label: 'd4', shapeName: 'Tetraedro' },
  { sides: 6, label: 'd6', shapeName: 'Hexaedro' },
  { sides: 8, label: 'd8', shapeName: 'Octaedro' },
  { sides: 10, label: 'd10', shapeName: 'Decaedro' },
  { sides: 12, label: 'd12', shapeName: 'Dodecaedro' },
  { sides: 20, label: 'd20', shapeName: 'Icosaedro' },
  { sides: 100, label: 'd100', shapeName: 'Percentil' },
];

export function rollSingleDie(sides: DiceSides): number {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const array = new Uint32Array(1);
    const maxValid = Math.floor(0xffffffff / sides) * sides;
    let rand = 0;
    do {
      window.crypto.getRandomValues(array);
      rand = array[0];
    } while (rand >= maxValid);
    return (rand % sides) + 1;
  }
  return Math.floor(Math.random() * sides) + 1;
}

export function executeDiceRoll(
  sides: DiceSides,
  count: number,
  modifier: number,
  mode: RollMode
): RollRecord {
  const safeCount = Math.max(1, Math.min(20, count));

  if (sides === 20 && safeCount === 1 && mode !== 'normal') {
    const first = rollSingleDie(20);
    const second = rollSingleDie(20);
    const kept = mode === 'advantage' ? Math.max(first, second) : Math.min(first, second);
    const dropped = mode === 'advantage' ? Math.min(first, second) : Math.max(first, second);
    const total = kept + modifier;

    return {
      id: `roll-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      sides,
      count: 1,
      modifier,
      mode,
      rolls: [first, second],
      keptRoll: kept,
      droppedRoll: dropped,
      subtotal: kept,
      total,
      isCrit: kept === 20,
      isFumble: kept === 1,
    };
  }

  const rolls: number[] = [];
  let subtotal = 0;
  for (let i = 0; i < safeCount; i++) {
    const val = rollSingleDie(sides);
    rolls.push(val);
    subtotal += val;
  }

  const total = subtotal + modifier;
  const isCrit = sides === 20 && safeCount === 1 && rolls[0] === 20;
  const isFumble = sides === 20 && safeCount === 1 && rolls[0] === 1;

  return {
    id: `roll-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    sides,
    count: safeCount,
    modifier,
    mode: 'normal',
    rolls,
    subtotal,
    total,
    isCrit,
    isFumble,
  };
}

let audioCtx: AudioContext | null = null;

export function playDiceSound(isCrit = false, isFumble = false): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Subtle wooden rattle clicks
    [0, 0.045, 0.09].forEach((offset, idx) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180 + idx * 45, now + offset);
      osc.frequency.exponentialRampToValueAtTime(90, now + offset + 0.035);
      gain.gain.setValueAtTime(0.08, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.045);
    });

    if (isCrit) {
      // Bright harmonic chord for Nat 20
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.11 + i * 0.04);
        gain.gain.setValueAtTime(0.06, now + 0.11 + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + 0.11 + i * 0.04);
        osc.stop(now + 0.46);
      });
    } else if (isFumble) {
      // Low dull tone for Nat 1
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, now + 0.11);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.35);
      gain.gain.setValueAtTime(0.05, now + 0.11);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + 0.11);
      osc.stop(now + 0.37);
    }
  } catch {
    // Ignore audio context restriction errors silently
  }
}
