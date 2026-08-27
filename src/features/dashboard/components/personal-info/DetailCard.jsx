import { Check, Edit2 } from 'lucide-react';
import { cn } from '@/shared/utils/utils';

export function DetailCard({ title, description, children, onEdit, isEditing, icon: Icon, isUpdating, className }) {
  return (
    <div className={cn('relative rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)]', className)}>
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-xs text-[#484848]">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onEdit}
            disabled={isUpdating}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-all shadow-xs cursor-pointer active:scale-95',
              isEditing
                ? 'bg-[#CB2A26] hover:bg-[#a82220] text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
            )}
          >
            {isUpdating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Save Changes
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </>
            )}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">{children}</div>
      </div>
    </div>
  );
}
