import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

export interface EntityStat {
  label: string;
  value: string | number;
  tone?: 'default' | 'crimson' | 'amber';
}

export interface EntityCardProps {
  title: string;
  metaLine: string;
  stats: EntityStat[];
  description?: string;
  isSelected?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  actionLabel?: string;
  footerSlot?: ReactNode;
}

export function EntityCard({
  title,
  metaLine,
  stats,
  description,
  isSelected = false,
  isLoading = false,
  onClick,
  actionLabel,
  footerSlot,
}: EntityCardProps) {
  const interactiveClasses = onClick
    ? 'cursor-pointer hover:border-[#4B5563] active:scale-[0.99]'
    : '';

  const selectedClasses = isSelected
    ? 'border-[#EF4444] bg-[#1C2029]'
    : 'border-[#2A303C] bg-[#171A21]';

  const Container = onClick ? 'button' : 'article';

  return (
    <Container
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`w-full text-left rounded-2xl border p-4 sm:p-5 transition-[border-color,background-color,transform] duration-150 flex flex-col justify-between gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4444] ${selectedClasses} ${interactiveClasses}`}
    >
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base sm:text-lg font-semibold text-[#F9FAFB] leading-snug truncate">
            {title}
          </h3>
          {onClick && (
            <ChevronRight
              className={`w-5 h-5 shrink-0 mt-0.5 transition-transform duration-150 ${
                isSelected ? 'text-[#EF4444] translate-x-0.5' : 'text-[#6B7280]'
              }`}
              aria-hidden="true"
            />
          )}
        </div>

        <p className="text-xs sm:text-[13px] text-[#9CA3AF] truncate">
          {isLoading ? 'Cargando ficha desde el compendio...' : metaLine}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#232834]">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="h-3 w-10 rounded bg-[#232834]" />
              <div className="h-5 w-12 rounded bg-[#2A303C]" />
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`grid gap-3 pt-3 border-t border-[#232834] ${
            stats.length === 2
              ? 'grid-cols-2'
              : stats.length >= 4
                ? 'grid-cols-2 sm:grid-cols-4'
                : 'grid-cols-3'
          }`}
        >
          {stats.map((stat) => {
            const valueColor =
              stat.tone === 'crimson'
                ? 'text-[#F87171]'
                : stat.tone === 'amber'
                  ? 'text-[#FBBF24]'
                  : 'text-[#F3F4F6]';

            return (
              <div key={stat.label} className="min-w-0">
                <div className="text-[11px] font-medium text-[#9CA3AF] truncate">
                  {stat.label}
                </div>
                <div
                  className={`font-mono-tabular text-sm sm:text-base font-semibold mt-0.5 truncate ${valueColor}`}
                >
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {description && !isLoading && (
        <p className="text-xs sm:text-sm text-[#D1D5DB] leading-relaxed line-clamp-3">
          {description}
        </p>
      )}

      {(actionLabel || footerSlot) && !isLoading && (
        <div className="pt-1 flex items-center justify-between gap-2 text-xs font-medium text-[#9CA3AF]">
          {actionLabel && (
            <span className="text-[#E5E7EB]">{actionLabel}</span>
          )}
          {footerSlot}
        </div>
      )}
    </Container>
  );
}
