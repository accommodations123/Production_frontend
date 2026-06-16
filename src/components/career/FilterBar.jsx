import { Search, MapPin, Briefcase, Filter } from 'lucide-react'

export function FilterBar() {
    return (
        <div className="sticky top-20 z-30 py-4 px-4">
            <div className="max-w-5xl mx-auto bg-[#0A1128]/80 backdrop-blur-md border border-white/10 rounded-2xl p-2 shadow-xl">
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-[#7B2CBF] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by role or keyword..."
                            className="w-full bg-white/5 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#7B2CBF]/50 transition-all"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-gray-300 hover:text-white border border-white/5 transition-colors whitespace-nowrap cursor-pointer">
                            <Briefcase className="w-4 h-4" /> Department
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-gray-300 hover:text-white border border-white/5 transition-colors whitespace-nowrap cursor-pointer">
                            <MapPin className="w-4 h-4" /> Location
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-gray-300 hover:text-white border border-white/5 transition-colors whitespace-nowrap cursor-pointer">
                            <Filter className="w-4 h-4" /> More Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
