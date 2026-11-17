import { X, Coins } from 'lucide-react';
import {
  formatAbilityModifier,
  formatChallengeRating,
  getArmorClassLabel,
  translateMonsterType,
  translateSize,
} from '../services/dndApi';
import type { MonsterDetail } from '../types/dnd';

interface MonsterDetailPanelProps {
  monster: MonsterDetail | null;
  isLoading: boolean;
  onClose: () => void;
  onGenerateLoot: (cr: number) => void;
}

export function MonsterDetailPanel({
  monster,
  isLoading,
  onClose,
  onGenerateLoot,
}: MonsterDetailPanelProps) {
  if (!monster && !isLoading) {
    return (
      <div className="hidden lg:flex flex-col items-center justify-center rounded-2xl border border-[#2A303C] bg-[#171A21] p-8 text-center min-h-[420px]">
        <p className="font-display text-lg font-semibold text-[#E5E7EB]">
          Selecciona una criatura
        </p>
        <p className="mt-2 text-sm text-[#9CA3AF] max-w-xs leading-relaxed">
          Elige cualquier enemigo del bestiario para consultar sus atributos completos, resistencias y acciones de combate.
        </p>
      </div>
    );
  }

  const abilities = monster
    ? [
        { label: 'FUE', score: monster.strength },
        { label: 'DES', score: monster.dexterity },
        { label: 'CON', score: monster.constitution },
        { label: 'INT', score: monster.intelligence },
        { label: 'SAB', score: monster.wisdom },
        { label: 'CAR', score: monster.charisma },
      ]
    : [];

  const speedText = monster
    ? Object.entries(monster.speed)
        .map(([k, v]) => `${k === 'walk' ? 'Pie' : k}: ${v}`)
        .join(' · ')
    : '';

  const sensesText = monster?.senses
    ? Object.entries(monster.senses)
        .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
        .join(' · ')
    : '';

  const content = isLoading || !monster ? (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="h-7 w-48 rounded bg-[#232834]" />
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#9CA3AF] hover:text-white hover:bg-[#232834]"
          aria-label="Cerrar ficha"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="h-4 w-64 rounded bg-[#232834]" />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-[#232834]" />
        ))}
      </div>
      <div className="h-32 rounded-xl bg-[#232834]" />
    </div>
  ) : (
    <div className="flex flex-col max-h-[85dvh] lg:max-h-[calc(100dvh-7.5rem)]">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-[#232834] flex items-start justify-between gap-4 shrink-0">
        <div className="min-w-0">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F9FAFB] leading-tight">
            {monster.name}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#9CA3AF]">
            {translateSize(monster.size)} · {translateMonsterType(monster.type)}
            {monster.subtype ? ` (${monster.subtype})` : ''} · {monster.alignment}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#9CA3AF] hover:text-white hover:bg-[#232834] transition-colors shrink-0"
          aria-label="Cerrar ficha de monstruo"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
        {/* Core Combat Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-[#1E222B] border border-[#2A303C] p-3">
            <div className="text-[11px] font-medium text-[#9CA3AF]">Clase Armadura</div>
            <div className="font-mono-tabular text-base sm:text-lg font-bold text-[#F9FAFB] mt-0.5 truncate">
              {getArmorClassLabel(monster.armor_class)}
            </div>
          </div>
          <div className="rounded-xl bg-[#1E222B] border border-[#2A303C] p-3">
            <div className="text-[11px] font-medium text-[#9CA3AF]">Puntos Golpe</div>
            <div className="font-mono-tabular text-base sm:text-lg font-bold text-[#F87171] mt-0.5">
              {monster.hit_points}
              <span className="text-xs font-normal text-[#9CA3AF] ml-1">
                ({monster.hit_dice})
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-[#1E222B] border border-[#2A303C] p-3">
            <div className="text-[11px] font-medium text-[#9CA3AF]">Desafío (ND)</div>
            <div className="font-mono-tabular text-base sm:text-lg font-bold text-[#FBBF24] mt-0.5">
              {formatChallengeRating(monster.challenge_rating)}
              {monster.xp ? (
                <span className="text-[11px] font-normal text-[#9CA3AF] ml-1">
                  · {monster.xp} XP
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Ability Scores */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {abilities.map((ab) => (
            <div
              key={ab.label}
              className="rounded-xl bg-[#13161C] border border-[#232834] py-2.5 px-2 text-center"
            >
              <div className="text-[11px] font-semibold text-[#9CA3AF]">
                {ab.label}
              </div>
              <div className="font-mono-tabular text-sm sm:text-base font-bold text-[#F9FAFB] mt-0.5">
                {formatAbilityModifier(ab.score)}
              </div>
              <div className="font-mono-tabular text-[11px] text-[#6B7280]">
                {ab.score}
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Properties */}
        <dl className="space-y-2.5 text-sm border-y border-[#232834] py-4">
          {speedText && (
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <dt className="font-semibold text-[#D1D5DB] shrink-0">Velocidad:</dt>
              <dd className="text-[#9CA3AF]">{speedText}</dd>
            </div>
          )}
          {sensesText && (
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <dt className="font-semibold text-[#D1D5DB] shrink-0">Sentidos:</dt>
              <dd className="text-[#9CA3AF]">{sensesText}</dd>
            </div>
          )}
          {monster.languages && (
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <dt className="font-semibold text-[#D1D5DB] shrink-0">Idiomas:</dt>
              <dd className="text-[#9CA3AF]">{monster.languages}</dd>
            </div>
          )}
          {monster.damage_resistances && monster.damage_resistances.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <dt className="font-semibold text-[#D1D5DB] shrink-0">Resistencias:</dt>
              <dd className="text-[#9CA3AF]">
                {monster.damage_resistances.join(', ')}
              </dd>
            </div>
          )}
          {monster.damage_immunities && monster.damage_immunities.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <dt className="font-semibold text-[#D1D5DB] shrink-0">Inmunidades:</dt>
              <dd className="text-[#9CA3AF]">
                {monster.damage_immunities.join(', ')}
              </dd>
            </div>
          )}
        </dl>

        {/* Special Abilities */}
        {monster.special_abilities && monster.special_abilities.length > 0 && (
          <section className="space-y-3">
            <h3 className="font-display text-sm font-bold text-[#F3F4F6] tracking-wide">
              Rasgos Especiales
            </h3>
            <div className="space-y-3">
              {monster.special_abilities.map((trait) => (
                <div key={trait.name} className="text-sm leading-relaxed">
                  <span className="font-semibold text-[#F9FAFB]">{trait.name}. </span>
                  <span className="text-[#D1D5DB]">{trait.desc}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Actions */}
        {monster.actions && monster.actions.length > 0 && (
          <section className="space-y-3">
            <h3 className="font-display text-sm font-bold text-[#F87171] tracking-wide">
              Acciones
            </h3>
            <div className="space-y-3">
              {monster.actions.map((action) => (
                <div
                  key={action.name}
                  className="rounded-xl bg-[#13161C] border border-[#232834] p-3.5 text-sm leading-relaxed"
                >
                  <div className="font-semibold text-[#F9FAFB] mb-1">
                    {action.name}
                    {typeof action.attack_bonus === 'number' ? (
                      <span className="font-mono-tabular text-xs font-medium text-[#FBBF24] ml-2">
                        (+{action.attack_bonus} al ataque)
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[#D1D5DB]">{action.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Legendary Actions */}
        {monster.legendary_actions && monster.legendary_actions.length > 0 && (
          <section className="space-y-3">
            <h3 className="font-display text-sm font-bold text-[#FBBF24] tracking-wide">
              Acciones Legendarias
            </h3>
            <div className="space-y-3">
              {monster.legendary_actions.map((action) => (
                <div key={action.name} className="text-sm leading-relaxed">
                  <span className="font-semibold text-[#F9FAFB]">{action.name}. </span>
                  <span className="text-[#D1D5DB]">{action.desc}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer CTA linking Module 1 -> Module 2 */}
      <div className="p-4 sm:p-5 border-t border-[#232834] shrink-0 bg-[#171A21] rounded-b-2xl">
        <button
          type="button"
          onClick={() => onGenerateLoot(monster.challenge_rating)}
          className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150 whitespace-nowrap"
        >
          <Coins className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>
            Generar botín (ND {formatChallengeRating(monster.challenge_rating)})
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Detail Panel */}
      <aside className="hidden lg:block lg:sticky lg:top-20 rounded-2xl border border-[#2A303C] bg-[#171A21]">
        {content}
      </aside>

      {/* Mobile Bottom Sheet Modal */}
      <div
        className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label={monster ? `Ficha de ${monster.name}` : 'Cargando ficha'}
      >
        <div
          className="absolute inset-0"
          onClick={onClose}
          aria-hidden="true"
        />
        <div className="relative z-10 w-full max-w-xl rounded-t-3xl border-t border-[#2A303C] bg-[#171A21] pb-safe">
          <div className="w-10 h-1.5 rounded-full bg-[#374151] mx-auto mt-3 mb-1" />
          {content}
        </div>
      </div>
    </>
  );
}
