import type { DiceSides } from '../types/dnd';

interface DiceSvgProps {
  sides: DiceSides;
  className?: string;
}

export function DiceSvg({ sides, className = 'w-8 h-8' }: DiceSvgProps) {
  switch (sides) {
    case 4:
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <polygon
            points="32,8 56,52 8,52"
            stroke="currentColor"
            strokeWidth="2.75"
            strokeLinejoin="round"
          />
          <line x1="32" y1="8" x2="32" y2="52" stroke="currentColor" strokeWidth="1.75" strokeOpacity="0.45" />
        </svg>
      );
    case 6:
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <rect
            x="11"
            y="11"
            width="42"
            height="42"
            rx="8"
            stroke="currentColor"
            strokeWidth="2.75"
          />
          <circle cx="24" cy="24" r="2.6" fill="currentColor" fillOpacity="0.55" />
          <circle cx="40" cy="40" r="2.6" fill="currentColor" fillOpacity="0.55" />
          <circle cx="32" cy="32" r="2.6" fill="currentColor" fillOpacity="0.55" />
        </svg>
      );
    case 8:
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <polygon
            points="32,6 56,32 32,58 8,32"
            stroke="currentColor"
            strokeWidth="2.75"
            strokeLinejoin="round"
          />
          <polygon
            points="32,6 45,32 32,58 19,32"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeOpacity="0.4"
            strokeLinejoin="round"
          />
          <line x1="8" y1="32" x2="56" y2="32" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.4" />
        </svg>
      );
    case 10:
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <polygon
            points="32,6 55,28 32,58 9,28"
            stroke="currentColor"
            strokeWidth="2.75"
            strokeLinejoin="round"
          />
          <polyline
            points="9,28 24,35 32,6 40,35 55,28"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeOpacity="0.45"
            strokeLinejoin="round"
          />
          <line x1="24" y1="35" x2="32" y2="58" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.45" />
          <line x1="40" y1="35" x2="32" y2="58" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.45" />
        </svg>
      );
    case 12:
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <polygon
            points="32,6 54,19 54,45 32,58 10,45 10,19"
            stroke="currentColor"
            strokeWidth="2.75"
            strokeLinejoin="round"
          />
          <polygon
            points="32,17 46,27 41,43 23,43 18,27"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeOpacity="0.45"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 20:
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <polygon
            points="32,6 55,19 55,45 32,58 9,45 9,19"
            stroke="currentColor"
            strokeWidth="2.75"
            strokeLinejoin="round"
          />
          <polygon
            points="32,14 48,42 16,42"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeOpacity="0.55"
            strokeLinejoin="round"
          />
          <line x1="32" y1="6" x2="32" y2="14" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.45" />
          <line x1="9" y1="19" x2="32" y2="14" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.45" />
          <line x1="55" y1="19" x2="32" y2="14" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.45" />
          <line x1="9" y1="45" x2="16" y2="42" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.45" />
          <line x1="55" y1="45" x2="48" y2="42" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.45" />
          <line x1="32" y1="58" x2="16" y2="42" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.45" />
          <line x1="32" y1="58" x2="48" y2="42" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.45" />
        </svg>
      );
    case 100:
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <circle cx="24" cy="34" r="15" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="42" cy="28" r="15" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.7" />
          <text
            x="32"
            y="36"
            textAnchor="middle"
            fill="currentColor"
            fontSize="11"
            fontWeight="700"
            fontFamily="monospace"
          >
            %
          </text>
        </svg>
      );
  }
}
