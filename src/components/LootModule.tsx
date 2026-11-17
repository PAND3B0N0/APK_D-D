import { useEffect, useState } from 'react';
import { Check, Coins, Copy, RefreshCw, X } from 'lucide-react';
import { formatChallengeRating } from '../services/dndApi';
import type { GeneratedLoot, LootItem, LootMode } from '../types/dnd';
import { generateLootForCR } from '../utils/lootEngine';
import { EntityCard } from './EntityCard';

interface LootModuleProps {
  initialCR?: number;
}

const CR_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 0, label: 'ND 0' },
  { value: 0.125, label: 'ND 1/8' },
  { value: 0.25, label: 'ND 1/4' },
  { value: 0.5, label: 'ND 1/2' },
  ...Array.from({ length: 30 }, (_, i) => ({
    value: i + 1,
    label: `ND ${i + 1}`,
  })),
];

const CR_TIERS: Array<{ label: string; sub: string; cr: number }> = [
  { label: 'Menor (0–4)', sub: 'Monedas bajas · Equipo básico', cr: 2 },
  { label: 'Moderado (5–10)', sub: 'Oro · Objetos poco comunes', cr: 7 },
  { label: 'Alto (11–16)', sub: 'Platino · Objetos raros', cr: 13 },
  { label: 'Épico (17+)', sub: 'Gran tesoro · Legendarios', cr: 20 },
];

export function LootModule({ initialCR }: LootModuleProps) {
  const [challengeRating, setChallengeRating] = useState<number>(initialCR ?? 2);
  const [mode, setMode] = useState<LootMode>('individual');
  const [currentLoot, setCurrentLoot] = useState<GeneratedLoot | null>(null);
  const [history, setHistory] = useState<GeneratedLoot[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [inspectedItem, setInspectedItem] = useState<LootItem | null>(null);

  useEffect(() => {
    if (typeof initialCR === 'number') {
      setChallengeRating(initialCR);
    }
  }, [initialCR]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setCopied(false);
    try {
      const loot = await generateLootForCR(challengeRating, mode);
      setCurrentLoot(loot);
      setHistory((prev) => [loot, ...prev].slice(0, 8));
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'No se pudo generar el botín desde la API de D&D 5e.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySummary = async () => {
    if (!currentLoot) return;
    const { coins, items } = currentLoot;
    const coinParts = [
      coins.pp > 0 ? `${coins.pp} PPt` : '',
      coins.gp > 0 ? `${coins.gp} PO` : '',
      coins.ep > 0 ? `${coins.ep} PE` : '',
      coins.sp > 0 ? `${coins.sp} PP` : '',
      coins.cp > 0 ? `${coins.cp} PC` : '',
    ].filter(Boolean);

    const lines = [
      `Botín ND ${formatChallengeRating(currentLoot.challengeRating)} (${
        currentLoot.mode === 'hoard' ? 'Tesoro de guarida' : 'Individual'
      })`,
      `Monedas: ${coinParts.length > 0 ? coinParts.join(', ') : 'Ninguna'} (~${currentLoot.totalGoldEquivalent} PO)`,
      'Objetos:',
      ...items.map((it) => `- ${it.name} [${it.category} · ${it.rarity}]`),
    ];

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback ignored cleanly
    }
  };

  const coinEntries = currentLoot
    ? [
        { code: 'PC', name: 'Cobre', amount: currentLoot.coins.cp, color: 'text-[#D97706]' },
        { code: 'PP', name: 'Plata', amount: currentLoot.coins.sp, color: 'text-[#D1D5DB]' },
        { code: 'PE', name: 'Electro', amount: currentLoot.coins.ep, color: 'text-[#93C5FD]' },
        { code: 'PO', name: 'Oro', amount: currentLoot.coins.gp, color: 'text-[#FBBF24]' },
        { code: 'PPt', name: 'Platino', amount: currentLoot.coins.pp, color: 'text-[#E5E7EB]' },
      ]
    : [];

  return (
    <section aria-label="Generador de Botín" className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F9FAFB] tracking-tight text-balance">
          Generador de Botín
        </h1>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          Calcula recompensas escaladas al Nivel de Desafío con equipo y objetos mágicos reales de la API.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Controls */}
        <div className="lg:col-span-5 space-y-5 rounded-2xl border border-[#2A303C] bg-[#171A21] p-5 sm:p-6">
          {/* Tier Presets */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-[#D1D5DB]">
              Tramo de Desafío rápido
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CR_TIERS.map((tier) => {
                const isInTier =
                  (tier.cr === 2 && challengeRating <= 4) ||
                  (tier.cr === 7 && challengeRating > 4 && challengeRating <= 10) ||
                  (tier.cr === 13 && challengeRating > 10 && challengeRating <= 16) ||
                  (tier.cr === 20 && challengeRating >= 17);

                return (
                  <button
                    key={tier.label}
                    type="button"
                    onClick={() => setChallengeRating(tier.cr)}
                    className={`min-h-[52px] text-left rounded-xl border p-3 transition-colors ${
                      isInTier
                        ? 'border-[#EF4444] bg-[#1E222B]'
                        : 'border-[#2A303C] bg-[#13161C] hover:border-[#4B5563]'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-semibold text-[#F9FAFB]">
                      {tier.label}
                    </div>
                    <div className="text-[11px] text-[#9CA3AF] mt-0.5 truncate">
                      {tier.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exact Challenge Rating Dropdown */}
          <div className="space-y-2">
            <label
              htmlFor="cr-select"
              className="block text-xs font-semibold text-[#D1D5DB]"
            >
              Nivel de Desafío exacto del enemigo
            </label>
            <select
              id="cr-select"
              value={challengeRating}
              onChange={(e) => setChallengeRating(Number(e.target.value))}
              className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-[#13161C] border border-[#2A303C] text-sm font-mono-tabular text-[#F9FAFB] focus:border-[#EF4444] focus:outline-none"
            >
              {CR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Loot Type Switch */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-[#D1D5DB]">
              Tipo de recompensa
            </span>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#13161C] border border-[#2A303C]">
              <button
                type="button"
                onClick={() => setMode('individual')}
                className={`min-h-[42px] px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  mode === 'individual'
                    ? 'bg-[#232834] text-white'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                Individual
              </button>
              <button
                type="button"
                onClick={() => setMode('hoard')}
                className={`min-h-[42px] px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  mode === 'hoard'
                    ? 'bg-[#232834] text-white'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                Tesoro de Guarida
              </button>
            </div>
          </div>

          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={isGenerating}
            className="w-full min-h-[50px] px-5 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] active:scale-[0.99] disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Consultando objetos y monedas...</span>
              </>
            ) : (
              <>
                <Coins className="w-4 h-4" aria-hidden="true" />
                <span>
                  Generar Botín (ND {formatChallengeRating(challengeRating)})
                </span>
              </>
            )}
          </button>

          {errorMsg && (
            <p className="text-xs text-[#FCA5A5] bg-[#1C1416] border border-[#7F1D1D] rounded-xl p-3">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Right Column: Generated Treasure Showcase */}
        <div className="lg:col-span-7 space-y-5">
          {!currentLoot ? (
            <div className="rounded-2xl border border-[#2A303C] bg-[#171A21] p-8 sm:p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1E222B] border border-[#2A303C] flex items-center justify-center mx-auto text-[#FBBF24]">
                <Coins className="w-6 h-6" aria-hidden="true" />
              </div>
              <h2 className="font-display text-lg font-semibold text-[#F9FAFB]">
                Cofre listo para repartir
              </h2>
              <p className="text-sm text-[#9CA3AF] max-w-md mx-auto leading-relaxed">
                Selecciona el Nivel de Desafío del enemigo derrotado y pulsa «Generar Botín» para obtener monedas y equipo consultados en vivo.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Coins Card */}
              <div className="rounded-2xl border border-[#2A303C] bg-[#171A21] p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg sm:text-xl font-bold text-[#F9FAFB]">
                      Tesoro obtenido · ND {formatChallengeRating(currentLoot.challengeRating)}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#9CA3AF] mt-0.5">
                      {currentLoot.mode === 'hoard' ? 'Tesoro de guarida' : 'Botín individual'} · Equivalente a{' '}
                      <span className="font-mono-tabular font-semibold text-[#FBBF24]">
                        {currentLoot.totalGoldEquivalent.toLocaleString('es-ES')} PO
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleCopySummary()}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl border border-[#2A303C] bg-[#13161C] hover:bg-[#1E222B] text-xs font-medium text-[#E5E7EB] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#34D399]" aria-hidden="true" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Copiar resumen</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 5 Coin Denominations */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {coinEntries.map((coin) => (
                    <div
                      key={coin.code}
                      className="rounded-xl bg-[#13161C] border border-[#232834] p-3"
                    >
                      <div className="text-[11px] font-medium text-[#9CA3AF]">
                        {coin.name} ({coin.code})
                      </div>
                      <div
                        className={`font-mono-tabular text-lg font-bold mt-1 ${
                          coin.amount > 0 ? coin.color : 'text-[#4B5563]'
                        }`}
                      >
                        {coin.amount.toLocaleString('es-ES')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real API Items rendered via reusable EntityCard */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base sm:text-lg font-semibold text-[#F9FAFB]">
                    Objetos encontrados ({currentLoot.items.length})
                  </h3>
                  <span className="text-xs text-[#9CA3AF]">
                    Toca un objeto para ver su descripción
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentLoot.items.map((item) => (
                    <EntityCard
                      key={item.id}
                      title={item.name}
                      metaLine={`${
                        item.source === 'magic-item' ? 'Objeto mágico' : 'Equipo'
                      } · ${item.category}`}
                      onClick={() => setInspectedItem(item)}
                      stats={[
                        {
                          label: 'Rareza',
                          value: item.rarity,
                          tone: item.source === 'magic-item' ? 'amber' : 'default',
                        },
                        {
                          label: 'Valor / Rango',
                          value: item.valueText,
                        },
                      ]}
                      description={item.description[0]}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Session History */}
          {history.length > 1 && (
            <div className="rounded-2xl border border-[#2A303C] bg-[#171A21] p-4 sm:p-5 space-y-3">
              <h3 className="text-xs font-semibold text-[#9CA3AF]">
                Botines recientes de la sesión
              </h3>
              <div className="divide-y divide-[#232834]">
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setCurrentLoot(entry)}
                    className={`w-full min-h-[44px] py-2.5 px-2 text-left flex items-center justify-between gap-3 hover:bg-[#1E222B] rounded-lg transition-colors ${
                      currentLoot?.id === entry.id ? 'bg-[#1E222B]' : ''
                    }`}
                  >
                    <span className="text-sm font-medium text-[#E5E7EB] truncate">
                      ND {formatChallengeRating(entry.challengeRating)} ·{' '}
                      {entry.mode === 'hoard' ? 'Guarida' : 'Individual'}
                    </span>
                    <span className="font-mono-tabular text-xs text-[#FBBF24] shrink-0">
                      {entry.totalGoldEquivalent.toLocaleString('es-ES')} PO ·{' '}
                      {entry.items.length} obj.
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Item Detail Modal */}
      {inspectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={inspectedItem.name}
        >
          <div
            className="absolute inset-0"
            onClick={() => setInspectedItem(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-[#2A303C] bg-[#171A21] p-5 sm:p-6 space-y-4 max-h-[80dvh] overflow-y-auto pb-safe">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-bold text-[#F9FAFB]">
                  {inspectedItem.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1">
                  {inspectedItem.category} · {inspectedItem.rarity} · {inspectedItem.valueText}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectedItem(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#9CA3AF] hover:text-white hover:bg-[#232834]"
                aria-label="Cerrar detalle de objeto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-[#D1D5DB] leading-relaxed border-t border-[#232834] pt-4">
              {inspectedItem.description.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
