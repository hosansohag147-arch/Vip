import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, ChevronLeft, SlidersHorizontal } from "lucide-react";
import { Anime } from "../types";

export const SearchView = ({ animes, onBack, onSelectAnime }: { animes: Anime[], onBack: () => void, onSelectAnime: (anime: Anime) => void }) => {
  const [query, setQuery] = useState("");

  const filtered = animes.filter(a => 
    a.title.toLowerCase().includes(query.toLowerCase()) || 
    (a.title_english && a.title_english.toLowerCase().includes(query.toLowerCase())) ||
    (a.synopsis && a.synopsis.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[80] bg-[#181a20] overflow-y-auto custom-scrollbar pb-32">
      <div className="sticky top-0 z-20 bg-[#181a20] pt-6 pb-4 px-6 flex items-center gap-4 border-b border-white/5">
        <button onClick={onBack} className="text-white hover:text-gray-300">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 flex items-center gap-3 bg-[#1f222a] border border-white/5 rounded-2xl px-4 py-2.5">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search anime, character, movies..." 
            className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button className="text-primary hover:text-primary/80 transition-colors">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-6 pt-6 pb-4 font-bold text-lg text-white">
        {query ? `Search Results (${filtered.length})` : 'Recommended Discoveries'}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 px-6">
        {(query ? filtered : animes.slice(0, 24)).map((anime, idx) => (
          <div 
            key={idx} 
            className="group cursor-pointer relative"
            onClick={() => onSelectAnime(anime)}
          >
            <div className="w-full aspect-[2/3] rounded-xl overflow-hidden relative border border-white/5 bg-[#0a0a0a] shadow-lg group-hover:border-primary/50 transition-colors">
               <img src={anime.images.jpg.large_image_url} alt={anime.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => { e.currentTarget.src = `https://placehold.co/400x600/0a0a0a/ffffff?text=${encodeURIComponent(anime.title)}`; }} />
               <div className="absolute top-2 left-2 bg-primary px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-sm flex items-center gap-1 z-10">
                 {anime.score || "N/A"}
               </div>
            </div>
            <h4 className="text-sm mt-3 mb-4 line-clamp-2 font-medium text-white group-hover:text-primary transition-colors">{anime.title_english || anime.title}</h4>
          </div>
        ))}
        {query && filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No results found for "{query}". Try checking your spelling or using less specific keywords.
          </div>
        )}
      </div>
    </motion.div>
  );
};
