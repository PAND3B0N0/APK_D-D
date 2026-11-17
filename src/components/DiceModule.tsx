import { useState } from 'react';
import { Minus, Plus, RotateCcw, Trash2, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';
import type { DiceSides, RollMode, RollRecord } from '../types/dnd';
import { executeDiceRoll, playDiceSound, STANDARD_DICE } from '../utils/diceEngine';
import { DiceSvg } from './DiceSvg';

export function DiceModule() {
  const [selectedSides, setSelectedSides] = useState<DiceSides>(20);
  const [count, setCount] = useState<number>(1);
  const [modifier, setModifier] = useState<number>(0);
  const [rollMode, setRollMode] = useState<RollMode>('normal');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [latestRoll, setLatestRoll] = useState<RollRecord | null>(null);
  const [history, setHistory] = useState<RollRecord[]>([]);

  const handleRoll = (overrideSides?: DiceSides) => {
    const sidesToRoll = overrideSides ?? selectedSides;
    if (overrideSides) {
      setSelectedSides(overrideSides);
    }

    const effectiveMode = sidesToRoll === 20 && count === 1 ? rollMode : 'normal';
    const record = executeDiceRoll(sidesToRoll, count, modifier, effectiveMode);

    if (soundEnabled) {
      playDiceSound(record.isCrit, record.isFumble);
    }

    setLatestRoll(record);
    setHistory((prev) => [record, ...prev].slice(0, 20));
  };

  const formulaLabel = `${count}d${selectedSides}${
    modifier > 0 ? ` + ${modifier}` : modifier < 0 ? ` - ${Math.abs(modifier)}` : ''
  }`;

  const canUseAdvantage = selectedSides === 20 && count === 1;

  return (
    <section aria-label="Bandeja de dados" className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F9FAFB] tracking-tight text-balance">
            Bandeja de Dados
          </h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            Selecciona un poliedro de d4 a d100 y lanza al instante durante la partida.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSoundEnabled((v) => !v)}
          aria-label={soundEnabled ? 'Silenciar sonido de dados' : 'Activar sonido de dados'}
          className="min-h-[44px] min-w-[44px] px-3 rounded-xl border border-[#2A303C] bg-[#171A21] text-[#D1D5DB] hover:text-white hover:bg-[#1E222B] inline-flex items-center gap-2 text-xs font-medium shrink-0"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-[#FBBF24]" aria-hidden="true" />
          ) : (
            <VolumeX className="w-4 h-4 text-[#6B7280]" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">
            {soundEnabled ? 'Sonido activo' : 'Silenciado'}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Center Column: Dice Picker + Result Stage */}
        <div className="lg:col-span-8 space-y-5">
          {/* 7 Standard D&D Dice Grid */}
          <div
            className="grid grid-cols-4 sm:grid-cols-7 gap-2.5"
            role="radiogroup"
            aria-label="Seleccionar tipo de dado"
          >
            {STANDARD_DICE.map((die) => {
              const active = selectedSides === die.sides;
              return (
                <button
                  key={die.sides}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelectedSides(die.sides)}
                  className={`min-h-[76px] rounded-2xl border p-2.5 flex flex-col items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 ${
                    active
                      ? 'border-[#EF4444] bg-[#221619] text-white'
                      : 'border-[#2A303C] bg-[#171A21] text-[#D1D5DB] hover:border-[#4B5563] hover:text-white'
                  }`}
                >
                  <DiceSvg
                    sides={die.sides}
                    className={`w-7 h-7 ${active ? 'text-[#F87171]' : 'text-[#9CA3AF]'}`}
                  />
                  <span className="font-mono-tabular text-xs sm:text-sm font-bold">
                    {die.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Central Roll Result Showcase */}
          <div className="rounded-2xl border border-[#2A303C] bg-[#171A21] p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[260px]">
            {!latestRoll ? (
              <div className="space-y-3 max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-[#1E222B] border border-[#2A303C] flex items-center justify-center mx-auto text-[#F87171]">
                  <DiceSvg sides={selectedSides} className="w-9 h-9" />
                </div>
                <p className="font-display text-lg font-semibold text-[#F9FAFB]">
                  Listo para lanzar {formulaLabel}
                </p>
                <p className="text-sm text-[#9CA3AF]">
                  Pulsa el botón «Lanzar» para generar un resultado aleatorio entre 1 y {selectedSides}.
                </p>
              </div>
            ) : (
              <motion.div
                key={latestRoll.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4 w-full max-w-md"
              >
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#9CA3AF]">
                  <DiceSvg sides={latestRoll.sides} className="w-4 h-4 text-[#F87171]" />
                  <span>
                    {latestRoll.count}d{latestRoll.sides}
                    {latestRoll.modifier !== 0
                      ? ` ${latestRoll.modifier > 0 ? '+' : '-'} ${Math.abs(latestRoll.modifier)}`
                      : ''}
                    {latestRoll.mode === 'advantage'
                      ? ' · Con Ventaja'
                      : latestRoll.mode === 'disadvantage'
                        ? ' · Con Desventaja'
                        : ''}
                  </span>
                </div>

                <div
                  className={`font-mono-tabular text-6xl sm:text-7xl font-bold tracking-tight ${
                    latestRoll.isCrit
                      ? 'text-[#FBBF24]'
                      : latestRoll.isFumble
                        ? 'text-[#F87171]'
                        : 'text-[#F9FAFB]'
                  }`}
                >
                  {latestRoll.total}
                </div>

                {latestRoll.isCrit && (
                  <p className="text-sm font-bold text-[#FBBF24]">
                    Crítico Natural (20 en d20)
                  </p>
                )}
                {latestRoll.isFumble && (
                  <p className="text-sm font-bold text-[#F87171]">
                    Pifia Crítica (1 en d20)
                  </p>
                )}

                {/* Individual Rolls Breakdown */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-mono-tabular text-[#D1D5DB]">
                  {latestRoll.mode !== 'normal' && latestRoll.droppedRoll !== undefined ? (
                    <span>
                      Dados: <strong className="text-white">{latestRoll.keptRoll}</strong> (usado) ·{' '}
                      <span className="line-through text-[#6B7280]">{latestRoll.droppedRoll}</span>{' '}
                      (descartado)
                    </span>
                  ) : (
                    <span>
                      Dados: [{latestRoll.rolls.join(', ')}]
                      {latestRoll.modifier !== 0 &&
                        ` ${latestRoll.modifier > 0 ? '+' : '-'} ${Math.abs(latestRoll.modifier)}`}
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Modifiers & Execute Roll Controls */}
          <div className="rounded-2xl border border-[#2A303C] bg-[#171A21] p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Count */}
              <div className="flex items-center justify-between rounded-xl bg-[#13161C] border border-[#232834] px-3 py-2">
                <span className="text-xs font-medium text-[#9CA3AF]">Cantidad</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCount((c) => Math.max(1, c - 1))}
                    disabled={count <= 1}
                    aria-label="Reducir cantidad de dados"
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-[#1E222B] text-white hover:bg-[#2A303C] disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-mono-tabular w-8 text-center text-sm font-bold text-white">
                    {count}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCount((c) => Math.min(10, c + 1))}
                    disabled={count >= 10}
                    aria-label="Aumentar cantidad de dados"
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-[#1E222B] text-white hover:bg-[#2A303C] disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modifier */}
              <div className="flex items-center justify-between rounded-xl bg-[#13161C] border border-[#232834] px-3 py-2">
                <span className="text-xs font-medium text-[#9CA3AF]">Modificador</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModifier((m) => Math.max(-10, m - 1))}
                    aria-label="Reducir modificador"
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-[#1E222B] text-white hover:bg-[#2A303C]"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-mono-tabular w-10 text-center text-sm font-bold text-white">
                    {modifier >= 0 ? `+${modifier}` : modifier}
                  </span>
                  <button
                    type="button"
                    onClick={() => setModifier((m) => Math.min(20, m + 1))}
                    aria-label="Aumentar modificador"
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-[#1E222B] text-white hover:bg-[#2A303C]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Advantage / Disadvantage for 1d20 */}
            {canUseAdvantage && (
              <div
                className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#13161C] border border-[#232834]"
                role="group"
                aria-label="Modo de tirada d20"
              >
                {(
                  [
                    { id: 'normal', label: 'Normal' },
                    { id: 'advantage', label: 'Ventaja' },
                    { id: 'disadvantage', label: 'Desventaja' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRollMode(opt.id)}
                    className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      rollMode === opt.id
                        ? 'bg-[#232834] text-white'
                        : 'text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* Primary Roll Button */}
            <button
              type="button"
              onClick={() => handleRoll()}
              className="w-full min-h-[52px] px-6 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] active:scale-[0.99] text-white font-semibold text-base flex items-center justify-center gap-2.5 transition-all duration-150"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Lanzar {formulaLabel}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Roll History */}
        <aside className="lg:col-span-4 rounded-2xl border border-[#2A303C] bg-[#171A21] p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-base font-semibold text-[#F9FAFB]">
              Historial de Tiradas
            </h2>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setHistory([])}
                className="min-h-[38px] px-2.5 py-1 rounded-lg text-xs font-medium text-[#9CA3AF] hover:text-white hover:bg-[#232834] inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Limpiar</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="text-sm text-[#9CA3AF] py-6 text-center">
              Aún no hay tiradas registradas en esta sesión.
            </p>
          ) : (
            <ul className="divide-y divide-[#232834] max-h-[440px] overflow-y-auto">
              {history.map((item) => (
                <li key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-[#E5E7EB] truncate">
                      {item.count}d{item.sides}
                      {item.modifier !== 0
                        ? ` ${item.modifier > 0 ? '+' : '-'} ${Math.abs(item.modifier)}`
                        : ''}
                      {item.mode === 'advantage'
                        ? ' · Ventaja'
                        : item.mode === 'disadvantage'
                          ? ' · Desventaja'
                          : ''}
                    </div>
                    <div className="font-mono-tabular text-xs text-[#9CA3AF] truncate">
                      [{item.rolls.join(', ')}]
                      {item.isCrit ? ' · Crítico' : item.isFumble ? ' · Pifia' : ''}
                    </div>
                  </div>

                  <span
                    className={`font-mono-tabular text-lg font-bold shrink-0 ${
                      item.isCrit
                        ? 'text-[#FBBF24]'
                        : item.isFumble
                          ? 'text-[#F87171]'
                          : 'text-[#F9FAFB]'
                    }`}
                  >
                    {item.total}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </section>
  );
}
