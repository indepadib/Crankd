'use client';

import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';

interface FilterSidebarProps {
    selectedCategories: string[];
    toggleCategory: (category: string) => void;
    selectedMakes: string[];
    toggleMake: (make: string) => void;
}


export function FilterSidebar({ selectedCategories, toggleCategory, selectedMakes, toggleMake }: FilterSidebarProps) {
    return (
        <div className="w-full lg:w-64 shrink-0 space-y-8">
            {/* Search */}
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim group-hover:text-signal-orange transition-colors" />
                <input
                    type="text"
                    placeholder="Search listings..."
                    className="w-full bg-steel/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-text-dim focus:outline-none focus:border-signal-orange/50 focus:bg-steel transition-all"
                />
            </div>

            {/* Filter Groups */}
            <div className="space-y-6">
                <div className="flex items-center justify-between text-xs font-bold uppercase text-text-dim tracking-wider mb-4">
                    <span>Filters</span>
                    <button className="flex items-center gap-1 hover:text-white transition-colors">
                        <SlidersHorizontal className="h-3 w-3" />
                        Reset
                    </button>
                </div>

                {/* Category */}
                <FilterGroup title="Category" expanded>
                    {['Vehicle', 'Part', 'Service'].map(cat => (
                        <label key={cat} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(cat)}
                                    onChange={() => toggleCategory(cat)}
                                    className="peer h-4 w-4 opacity-0 absolute"
                                />
                                <div className="h-4 w-4 rounded border border-white/20 bg-carbon flex items-center justify-center peer-checked:border-signal-orange peer-checked:bg-signal-orange transition-all">
                                    <div className="h-2 w-2 bg-white rounded-sm opacity-0 peer-checked:opacity-100" />
                                </div>
                            </div>
                            <span className="text-sm text-text-dim group-hover:text-white transition-colors font-medium">{cat}s</span>
                        </label>
                    ))}
                </FilterGroup>

                {/* Price Range */}
                <FilterGroup title="Price Range">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim text-xs">$</span>
                            <input type="text" placeholder="Min" className="w-full bg-carbon border border-white/10 rounded-lg py-2 pl-6 pr-2 text-xs text-white focus:border-signal-orange/50 focus:outline-none transition-colors" />
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim text-xs">$</span>
                            <input type="text" placeholder="Max" className="w-full bg-carbon border border-white/10 rounded-lg py-2 pl-6 pr-2 text-xs text-white focus:border-signal-orange/50 focus:outline-none transition-colors" />
                        </div>
                    </div>
                </FilterGroup>

                {/* Make */}
                <FilterGroup title="Make">
                    {['BMW', 'Porsche', 'Nissan', 'Honda', 'Toyota', 'Mazda'].map(make => (
                        <label key={make} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedMakes.includes(make)}
                                    onChange={() => toggleMake(make)}
                                    className="peer h-4 w-4 opacity-0 absolute"
                                />
                                <div className="h-4 w-4 rounded border border-white/20 bg-carbon flex items-center justify-center peer-checked:border-signal-orange peer-checked:bg-signal-orange transition-all">
                                    <div className="h-2 w-2 bg-white rounded-sm opacity-0 peer-checked:opacity-100" />
                                </div>
                            </div>
                            <span className="text-sm text-text-dim group-hover:text-white transition-colors font-medium">{make}</span>
                        </label>
                    ))}
                </FilterGroup>
            </div>
        </div>
    );
}

function FilterGroup({ title, children, expanded = false }: { title: string, children: React.ReactNode, expanded?: boolean }) {
    return (
        <div className="border-b border-white/5 pb-6">
            <button className="flex items-center justify-between w-full text-sm font-bold text-white mb-4 hover:text-signal-orange transition-colors group">
                {title}
                <ChevronDown className="h-4 w-4 text-text-dim group-hover:text-signal-orange transition-colors" />
            </button>
            <div className="space-y-1">
                {children}
            </div>
        </div>
    );
}
