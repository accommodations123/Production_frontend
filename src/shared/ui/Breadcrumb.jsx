import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumb({ items = [], className = '' }) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-xs font-semibold text-slate-500 overflow-x-auto no-scrollbar py-1 ${className}`}
    >
      <ol className="flex items-center gap-1.5 whitespace-nowrap">
        {/* Home Link */}
        <li className="flex items-center gap-1.5">
          <Link
            to="/"
            className="flex items-center gap-1 text-slate-600 hover:text-[#CB2A26] transition-colors focus:outline-none focus:underline"
            title="Go to Home"
          >
            <Home className="w-3.5 h-3.5 shrink-0" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5 min-w-0">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 select-none" />
              {isLast || !item.path ? (
                <span
                  className="font-bold text-[#00162D] truncate max-w-[180px] sm:max-w-[260px]"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-slate-600 hover:text-[#CB2A26] transition-colors truncate max-w-[150px] sm:max-w-[200px] focus:outline-none focus:underline"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
