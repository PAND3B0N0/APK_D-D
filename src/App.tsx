import { useState } from 'react';
import { BookOpen, Coins, Dices, X } from 'lucide-react';
import { BestiaryModule } from './components/BestiaryModule';
import { DiceModule } from './components/DiceModule';
import { LootModule } from './components/LootModule';
import type { ModuleTab } from './types/dnd';
import { executeDiceRoll, playDiceSound } from './utils/diceEngine';

interface QuickRollToast {
  total: number;
  isCrit: boolean;
  isFumble: boolean;
}

const NAV_ITEMS: Array<{
  id: ModuleTab;
  label: string;
  icon: typeof BookOpen;
}> = [
  { id: 'bestiary', label: 'Bestiario', icon: BookOpen },
  { id: 'loot', label: 'Botín', icon: Coins },
  { id: 'dice', label: 'Dados', icon: Dices },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ModuleTab>('bestiary');
  const [lootInitialCR, setLootInitialCR] = useState<number | undefined>(undefined);
  const [quickRoll, setQuickRoll] = useState<QuickRollToast | null>(null);

  const handleSendToLoot = (cr: number) => {
    setLootInitialCR(cr);
    setActiveTab('loot');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickD20 = () => {
    const result = executeDiceRoll(20, 1, 0, 'normal');
    playDiceSound(result.isCrit, result.isFumble);
    setQuickRoll({
      total: result.total,
      isCrit: result.isCrit,
      isFumble: result.isFumble,
    });
  };

  const handleTabChange = (tab: ModuleTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[#0F1115] text-[#F3F4F6] overflow-x-hidden">
      {/* Top Navigation Bar: Desktop 3-Zone Contract / Compact Mobile Header */}
      <header className="sticky top-0 z-30 h-12 md:h-16 bg-[#0F1115]/90 backdrop-blur-md border-b border-[#232834] pt-safe">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleTabChange('bestiary')}
            className="font-display text-base sm:text-xl font-bold tracking-tight text-[#F9FAFB] whitespace-nowrap shrink-0 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EF4444]"
          >
            Grimorio DM
          </button>

          {/* Zone 2: Clean Typography Nav Links (Desktop) */}
          <nav
            aria-label="Módulos principales"
            className="hidden md:flex items-center gap-8 h-full"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabChange(item.id)}
                  className={`h-full px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'border-[#EF4444] text-[#F9FAFB]'
                      : 'border-transparent text-[#9CA3AF] hover:text-[#F9FAFB]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={handleQuickD20}
              className="min-h-[38px] md:min-h-[40px] px-3.5 md:px-4 py-1.5 md:py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap shrink-0"
            >
              Tirada d20
            </button>
          </div>
        </div>
      </header>

      {/* Quick d20 Roll Popover */}
      {quickRoll && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-14 md:top-20 right-4 z-40 rounded-2xl border border-[#2A303C] bg-[#171A21] px-4 py-3 shadow-xl flex items-center gap-4"
        >
          <div>
            <div className="text-[11px] font-medium text-[#9CA3AF]">
              Tirada rápida 1d20
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono-tabular text-2xl font-bold ${
                  quickRoll.isCrit
                    ? 'text-[#FBBF24]'
                    : quickRoll.isFumble
                      ? 'text-[#F87171]'
                      : 'text-white'
                }`}
              >
                {quickRoll.total}
              </span>
              {quickRoll.isCrit && (
                <span className="text-xs font-semibold text-[#FBBF24]">
                  Crítico Natural
                </span>
              )}
              {quickRoll.isFumble && (
                <span className="text-xs font-semibold text-[#F87171]">
                  Pifia
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setQuickRoll(null)}
            aria-label="Cerrar resultado rápido"
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-white hover:bg-[#232834]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-12">
        {activeTab === 'bestiary' && (
          <BestiaryModule onSendToLoot={handleSendToLoot} />
        )}
        {activeTab === 'loot' && <LootModule initialCR={lootInitialCR} />}
        {activeTab === 'dice' && <DiceModule />}
      </main>

      {/* Desktop Subtle Footer */}
      <footer className="hidden md:block border-t border-[#232834] py-6 text-center text-xs text-[#6B7280]">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <span>Grimorio DM · Asistente para partidas de Dungeons &amp; Dragons 5e</span>
          <span>Datos en vivo desde dnd5eapi.co</span>
        </div>
      </footer>

      {/* Mobile Bottom Tab Bar (Thumb Zone, <= 15% total sticky viewport height) */}
      <nav
        aria-label="Navegación móvil"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0F1115]/95 backdrop-blur-md border-t border-[#232834] pb-safe"
      >
        <div className="grid grid-cols-3 h-14 items-center">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabChange(item.id)}
                className={`h-full min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive ? 'text-[#F87171]' : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
                }`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="text-[11px] font-medium leading-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
