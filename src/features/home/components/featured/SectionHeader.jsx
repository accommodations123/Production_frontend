import { Link } from 'react-router-dom';
import { ChevronRight, Plus } from 'lucide-react';

export const SectionHeader = ({ title, subtitle, linkText, linkTo, actionText, actionTo }) => (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div className="max-w-2xl text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-[-0.02em]">{title}</h2>
            {subtitle && <p className="text-slate-500 text-sm md:text-base mt-1">{subtitle}</p>}
        </div>
        <div className="flex flex-row items-center gap-4 shrink-0 sm:self-end">
            {actionText && actionTo && (
                <Link
                    to={actionTo}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-white font-semibold rounded-xl text-xs shadow-sm hover:bg-accent/95 active:scale-98 transition-all"
                    aria-label={actionText}
                >
                    <Plus className="h-3.5 w-3.5" />
                    {actionText}
                </Link>
            )}
            {linkText && linkTo && (
                <Link
                    to={linkTo}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
                    aria-label={`View ${linkText}`}
                >
                    <span>{linkText}</span>
                    <ChevronRight className="h-4 w-4" />
                </Link>
            )}
        </div>
    </div>
);
