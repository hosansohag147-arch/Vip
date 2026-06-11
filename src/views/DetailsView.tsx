import { motion } from "motion/react";
import { Play, Download, ChevronLeft, Search, Star, Bookmark, Send, MessageCircle } from "lucide-react";
import { Anime } from "../types";
import { useState } from "react";

export const DetailsView = ({ anime, onBack, onPlay }: { anime: Anime, onBack: () => void, onPlay: (episodeId: number) => void }) => {
  const [activeTab, setActiveTab] = useState<'episodes' | 'more' | 'comments'>('episodes');

  const episodes = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    title: `Episode ${i + 1}`,
    duration: "24:20"
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-[#181a20] overflow-y-auto custom-scrollbar pb-32">
      {/* Top Navbar overlapping hero */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-30">
        <button onClick={onBack} className="text-white hover:text-gray-300 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button className="text-white hover:text-gray-300 transition-colors">
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Image */}
      <div className="relative w-full aspect-square md:aspect-video lg:aspect-[21/9] max-h-[500px]">
        <img 
          src={anime.images.jpg.large_image_url} 
          alt={anime.title} 
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = `https://placehold.co/800x450/0a0a0a/ffffff?text=${encodeURIComponent(anime.title)}`; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#181a20] via-[#181a20]/40 to-transparent"></div>
      </div>

      <div className="relative z-20 px-6 -mt-32 md:-mt-48 max-w-4xl mx-auto">
        {/* Title and actions header */}
        <div className="flex justify-between items-end mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-md pr-4 line-clamp-2">
            {anime.title_english || anime.title}
          </h1>
          <div className="flex gap-4">
            <button className="text-white hover:text-primary transition-colors"><Bookmark className="w-5 h-5" /></button>
            <button className="text-white hover:text-primary transition-colors"><Send className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs md:text-sm font-medium mb-6">
          <div className="flex items-center gap-1 text-primary">
            <Star className="w-3 h-3 fill-primary" />
            <span>{anime.score || "9.8"}</span>
          </div>
          <span className="text-gray-400">2022</span>
          <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] md:text-xs uppercase">13+</span>
          <span className="border border-white/20 text-gray-300 px-2 py-0.5 rounded text-[10px] md:text-xs">Japan</span>
          <span className="border border-white/20 text-gray-300 px-2 py-0.5 rounded text-[10px] md:text-xs">Subtitle</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button onClick={() => onPlay(1)} className="flex-1 bg-primary text-white py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <Play className="w-4 h-4 fill-white" /> Play
          </button>
          <button className="flex-1 bg-[#1f222a] text-white py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#2a2e39] transition-colors border border-white/5">
            <Download className="w-4 h-4" /> Download
          </button>
        </div>

        {/* Synopsis */}
        <p className="text-gray-300 text-xs md:text-sm leading-relaxed font-light mb-8">
          <span className="font-semibold text-white">Genre:</span> Action, Shounen, Dark Fantasy...<br/>
          {anime.synopsis} <span className="text-primary font-medium cursor-pointer">View More</span>
        </p>

        {/* Tabs */}
        <div className="border-b border-white/10 flex justify-between mb-6">
          <button 
            onClick={() => setActiveTab('episodes')}
            className={`pb-4 px-2 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'episodes' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-white'}`}
          >
            Episodes
          </button>
          <button 
            onClick={() => setActiveTab('more')}
            className={`pb-4 px-2 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'more' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-white'}`}
          >
            More Like This
          </button>
          <button 
            onClick={() => setActiveTab('comments')}
            className={`pb-4 px-2 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'comments' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-white'}`}
          >
            Comments (29.5K)
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'episodes' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white text-lg">Episodes</h3>
              <span className="text-primary text-sm font-medium cursor-pointer">Season 2 ∨</span>
            </div>
            
            <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-6 snap-x">
              {episodes.map(ep => (
                <div 
                  key={ep.id}
                  onClick={() => onPlay(ep.id)}
                  className="w-32 md:w-48 flex-shrink-0 cursor-pointer group snap-start"
                >
                  <div className="w-full aspect-video rounded-xl overflow-hidden relative mb-2 border border-white/5 bg-[#0a0a0a]">
                    <img src={anime.images.jpg.large_image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    
                    <div className="absolute bottom-1 right-2 text-[10px] text-white font-medium drop-shadow-md">
                      {ep.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Tabs Empty State */}
        {activeTab !== 'episodes' && (
          <div className="py-12 text-center text-gray-500 text-sm">
            Content for this tab is coming soon.
          </div>
        )}
      </div>
    </motion.div>
  );
};
