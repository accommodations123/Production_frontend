import { Info } from "lucide-react";

export function SellFormCategoryStep({
  categoryMap,
  selectedCategory,
  selectedSubCategory,
  onSelectCategory,
  onSelectSubCategory,
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Category *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {Object.keys(categoryMap).map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`py-3 px-3 rounded-xl border font-bold text-xs transition-all text-left flex items-center justify-between ${
                  isSelected
                    ? "bg-[#00162D] text-white border-[#00162D] shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>{cat}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {selectedCategory && categoryMap[selectedCategory] && (
        <div className="animate-in fade-in duration-200">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Item Type *
          </label>
          <div className="flex flex-wrap gap-2">
            {categoryMap[selectedCategory].map((sub) => {
              const isSelected = selectedSubCategory === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => onSelectSubCategory(sub)}
                  className={`py-2 px-3.5 rounded-xl border text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-red-600 text-white border-red-600 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!selectedCategory && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800 text-xs">
          <Info size={16} className="shrink-0" />
          <span>Select a main category to view item types.</span>
        </div>
      )}
    </div>
  );
}
