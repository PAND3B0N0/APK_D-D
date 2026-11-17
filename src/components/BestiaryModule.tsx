import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Search, X } from 'lucide-react';
import {
  fetchMonsterDetail,
  fetchMonsterList,
  fetchMonstersBatch,
  formatChallengeRating,
  getArmorClassValue,
  getCachedMonsterDetail,
  translateMonsterType,
  translateSize,
} from '../services/dndApi';
import type { ApiResourceRef, MonsterDetail } from '../types/dnd';
import { EntityCard } from './EntityCard';
import { MonsterDetailPanel } from './MonsterDetailPanel';

interface BestiaryModuleProps {
  onSendToLoot: (cr: number) => void;
}

const CR_FILTERS: Array<{ id: string; label: string; query?: string }> = [
  { id: 'all', label: 'Todos' },
  { id: '0-1', label: 'ND 0–1', query: '0,0.125,0.25,0.5,1' },
  { id: '2-4', label: 'ND 2–4', query: '2,3,4' },
  { id: '5-10', label: 'ND 5–10', query: '5,6,7,8,9,10' },
  { id: '11-16', label: 'ND 11–16', query: '11,12,13,14,15,16' },
  { id: '17+', label: 'ND 17+', query: '17,18,19,20,21,22,23,24,25,26,27,28,29,30' },
];

const PAGE_SIZE = 12;

export function BestiaryModule({ onSendToLoot }: BestiaryModuleProps) {
  const [crFilterId, setCrFilterId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const [monsterRefs, setMonsterRefs] = useState<ApiResourceRef[]>([]);
  const [detailsMap, setDetailsMap] = useState<Record<string, MonsterDetail>>({});
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [isLoadingBatch, setIsLoadingBatch] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);
  const [selectedMonster, setSelectedMonster] = useState<MonsterDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  const activeCrFilter = useMemo(
    () => CR_FILTERS.find((f) => f.id === crFilterId) ?? CR_FILTERS[0],
    [crFilterId]
  );

  const loadList = useCallback(async () => {
    setIsLoadingList(true);
    setErrorMsg(null);
    try {
      const results = await fetchMonsterList(activeCrFilter.query);
      setMonsterRefs(results);
      setPage(1);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'No se pudo conectar con la API de D&D 5e.'
      );
    } finally {
      setIsLoadingList(false);
    }
  }, [activeCrFilter.query]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const filteredRefs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return monsterRefs;
    return monsterRefs.filter((m) => m.name.toLowerCase().includes(q));
  }, [monsterRefs, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRefs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const visibleRefs = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredRefs.slice(start, start + PAGE_SIZE);
  }, [filteredRefs, safePage]);

  // Fetch details for visible monster cards so CA, PG, and ND always render on each card
  useEffect(() => {
    if (visibleRefs.length === 0) return;

    let cancelled = false;
    const indices = visibleRefs.map((r) => r.index);

    const missing = indices.filter((idx) => !getCachedMonsterDetail(idx));
    if (missing.length === 0) {
      const cachedPatch: Record<string, MonsterDetail> = {};
      indices.forEach((idx) => {
        const cached = getCachedMonsterDetail(idx);
        if (cached) cachedPatch[idx] = cached;
      });
      setDetailsMap((prev) => ({ ...prev, ...cachedPatch }));
      return;
    }

    setIsLoadingBatch(true);
    void fetchMonstersBatch(indices, 6)
      .then((batchResult) => {
        if (cancelled) return;
        const patch: Record<string, MonsterDetail> = {};
        batchResult.forEach((val, key) => {
          patch[key] = val;
        });
        setDetailsMap((prev) => ({ ...prev, ...patch }));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingBatch(false);
      });

    return () => {
      cancelled = true;
    };
  }, [visibleRefs]);

  const handleSelectMonster = async (index: string) => {
    setSelectedIndex(index);
    const cached = detailsMap[index] ?? getCachedMonsterDetail(index);
    if (cached) {
      setSelectedMonster(cached);
      return;
    }

    setIsLoadingDetail(true);
    try {
      const detail = await fetchMonsterDetail(index);
      setDetailsMap((prev) => ({ ...prev, [index]: detail }));
      setSelectedMonster(detail);
    } catch {
      setSelectedMonster(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCrFilterId('all');
    setPage(1);
  };

  return (
    <section aria-label="Bestiario de enemigos" className="space-y-6">
      {/* Section Header & Search Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F9FAFB] tracking-tight text-balance">
              Bestiario de Partida
            </h1>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              Consulta criaturas oficiales de D&D 5e con estadísticas de combate en tiempo real.
            </p>
          </div>
          {!isLoadingList && !errorMsg && (
            <p className="font-mono-tabular text-xs sm:text-sm text-[#9CA3AF] shrink-0">
              {filteredRefs.length} {filteredRefs.length === 1 ? 'criatura' : 'criaturas'}
            </p>
          )}
        </div>

        {/* Search Input + CR Segmented Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search
              className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar monstruo por nombre (ej. Goblin, Dragon, Lich)..."
              aria-label="Buscar monstruo por nombre"
              className="w-full min-h-[46px] pl-10 pr-10 py-2.5 rounded-xl bg-[#171A21] border border-[#2A303C] text-sm text-[#F9FAFB] placeholder:text-[#6B7280] focus:border-[#EF4444] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                aria-label="Limpiar búsqueda"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* CR Tier Filter Buttons */}
          <div
            className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#171A21] border border-[#2A303C]"
            role="group"
            aria-label="Filtrar por nivel de desafío"
          >
            {CR_FILTERS.map((filter) => {
              const active = filter.id === crFilterId;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setCrFilterId(filter.id)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#DC2626] text-white'
                      : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1E222B]'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error State */}
      {errorMsg && (
        <div className="rounded-2xl border border-[#7F1D1D] bg-[#1C1416] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#FCA5A5]">
              Error al consultar el bestiario
            </h2>
            <p className="text-sm text-[#D1D5DB] mt-1">{errorMsg}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadList()}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* Main Split Content: Grid + Sticky Detail Panel */}
      {!errorMsg && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Monster Cards Grid */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-5">
            {isLoadingList ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <EntityCard
                    key={idx}
                    title="Cargando criatura..."
                    metaLine=""
                    stats={[]}
                    isLoading
                  />
                ))}
              </div>
            ) : visibleRefs.length === 0 ? (
              <div className="rounded-2xl border border-[#2A303C] bg-[#171A21] p-8 text-center space-y-3">
                <p className="text-base font-semibold text-[#F9FAFB]">
                  No se encontraron criaturas
                </p>
                <p className="text-sm text-[#9CA3AF]">
                  Prueba otro término de búsqueda o restablece el filtro de Nivel de Desafío.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#232834] hover:bg-[#2A303C] text-sm font-medium text-white transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {visibleRefs.map((ref) => {
                    const detail = detailsMap[ref.index];
                    const isCardLoading = !detail && isLoadingBatch;

                    return (
                      <EntityCard
                        key={ref.index}
                        title={ref.name}
                        metaLine={
                          detail
                            ? `${translateSize(detail.size)} · ${translateMonsterType(detail.type)} · ${detail.alignment}`
                            : 'Compendio D&D 5e'
                        }
                        isLoading={isCardLoading || !detail}
                        isSelected={selectedIndex === ref.index}
                        onClick={() => void handleSelectMonster(ref.index)}
                        stats={
                          detail
                            ? [
                                {
                                  label: 'Clase Armadura',
                                  value: getArmorClassValue(detail.armor_class),
                                },
                                {
                                  label: 'Puntos Golpe',
                                  value: detail.hit_points,
                                  tone: 'crimson',
                                },
                                {
                                  label: 'Desafío (ND)',
                                  value: formatChallengeRating(detail.challenge_rating),
                                  tone: 'amber',
                                },
                              ]
                            : []
                        }
                      />
                    );
                  })}
                </div>

                {/* Pagination Bar */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage <= 1}
                      className="min-h-[44px] px-4 py-2 rounded-xl border border-[#2A303C] bg-[#171A21] text-sm font-medium text-[#E5E7EB] hover:bg-[#1E222B] disabled:opacity-40 disabled:pointer-events-none inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Anterior</span>
                    </button>

                    <span className="font-mono-tabular text-xs sm:text-sm text-[#9CA3AF]">
                      Página {safePage} de {totalPages}
                    </span>

                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage >= totalPages}
                      className="min-h-[44px] px-4 py-2 rounded-xl border border-[#2A303C] bg-[#171A21] text-sm font-medium text-[#E5E7EB] hover:bg-[#1E222B] disabled:opacity-40 disabled:pointer-events-none inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <span>Siguiente</span>
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Statblock Detail Panel */}
          <div className="lg:col-span-5 xl:col-span-4">
            <MonsterDetailPanel
              monster={selectedMonster}
              isLoading={isLoadingDetail}
              onClose={() => {
                setSelectedIndex(null);
                setSelectedMonster(null);
              }}
              onGenerateLoot={onSendToLoot}
            />
          </div>
        </div>
      )}
    </section>
  );
}
