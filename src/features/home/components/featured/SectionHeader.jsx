import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';

export const SectionHeader = ({ title, subtitle, linkText, linkTo, actionText, actionTo }) => (
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-8 bg-[#E1392A] rounded-full"></div>
                <h2 className="text-3xl md:text-4xl font-black text-[#00142E] tracking-tight">{title}</h2>
            </div>
            <p className="text-[#00142E]/70 text-lg pl-5">{subtitle}</p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            {actionText && actionTo && (
                <Link
                    to={actionTo}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#E1392A] hover:bg-[#a0221e] text-white font-bold rounded-full text-xs shadow-md transition-all hover:scale-105 duration-300 mb-1"
                    aria-label={actionText}
                >
                    <Plus className="h-3.5 w-3.5" />
                    {actionText}
                </Link>
            )}
            {linkText && linkTo && (
                <Link
                    to={linkTo}
                    className="group flex items-center gap-2 text-[#00142E] font-bold hover:text-[#E1392A] transition-colors border-b-2 border-transparent hover:border-[#E1392A] pb-1"
                    aria-label={`View ${linkText}`}
                >
                    {linkText}
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            )}
        </div>
    </div>
);
