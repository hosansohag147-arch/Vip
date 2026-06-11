import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, Maximize, Minimize, Settings, Volume2, VolumeX, SkipBack, SkipForward, ArrowLeft, Plus, Check, Share2, Download, ExternalLink, Star, Tv, ChevronDown, ChevronRight } from "lucide-react";
import { Anime } from "../types";
import { useState, useRef, useEffect } from "react";
import { STREAM_CONFIG } from "../config";

export const PlayerView = ({ anime, episodeId: initialEpisode, onBack, onSelectAnime }: { anime: Anime, episodeId: number, onBack: () => void, onSelectAnime?: (anime: Anime) => void }) => {
  const [recommendations, setRecommendations] = useState<Anime[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [currentDub, setCurrentDub] = useState<"SUB" | "DUB">("SUB");
  const [selectedDomain, setSelectedDomain] = useState<string>(STREAM_CONFIG.ACTIVE_DOMAIN);
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const [isAdded, setIsAdded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const episodes = Array.from({ length: 24 }).map((_, i) => i + 1);

  useEffect(() => {
    let isMounted = true;
    fetch(`https://api.jikan.moe/v4/top/anime?filter=airing&limit=12`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (data && data.data) {
          setRecommendations(data.data);
        }
      })
      .catch(console.error);
    return () => { isMounted = false; };
  }, [anime.mal_id]);

  useEffect(() => {
    // URL Generation Logic
    const slug = anime.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const suffix = currentDub === "DUB" ? "-dub" : "";
    const generatedUrl = selectedDomain ? `https://${selectedDomain}/episode/${slug}-1x${currentEpisode}${suffix}/` : "";
    setIframeUrl(generatedUrl);
  }, [anime, currentEpisode, currentDub, selectedDomain]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[100] bg-[#181a20] overflow-y-auto custom-scrollbar pb-10">
      
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 20, x: '-50%' }} 
            animate={{ opacity: 1, y: 0, x: '-50%' }} 
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[110] bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-medium border border-white/10 shadow-2xl pointer-events-none"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => onBack()} className="w-10 h-10 rounded-full bg-[#1f222a] border border-white/5 flex items-center justify-center text-white hover:text-primary transition-colors cursor-pointer shadow-lg hover:bg-[#2a2e39]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-white font-bold text-lg md:text-xl line-clamp-1">{anime.title_english || anime.title} : Episode {currentEpisode}</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentDub("SUB")}
            className={`transition-colors px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border ${currentDub === 'SUB' ? 'bg-primary border-primary text-white' : 'bg-[#1f222a] border-white/5 text-gray-300 hover:bg-[#2a2e39] hover:text-white'}`}>
            Sub
          </button>
          <button 
            onClick={() => setCurrentDub("DUB")}
            className={`transition-colors px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border ${currentDub === 'DUB' ? 'bg-primary border-primary text-white' : 'bg-[#1f222a] border-white/5 text-gray-300 hover:bg-[#2a2e39] hover:text-white'}`}>
            Dub
          </button>
        </div>
      </div>

      {/* Video Player Box */}
      <div className="relative w-full aspect-video bg-black flex-shrink-0 mt-2 max-w-7xl mx-auto md:rounded-3xl overflow-hidden shadow-2xl border border-white/5">
        {iframeUrl ? (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
            <iframe
              src={iframeUrl}
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: '#000',
                border: 'none'
              }}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-white">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6">
        
        {/* Title */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl md:text-3xl font-bold text-white flex items-center gap-2 cursor-pointer hover:text-gray-300 transition-colors">
            {anime.title_english || anime.title} <ChevronRight className="w-6 h-6 text-gray-400 mt-1" />
          </h1>
        </div>
        
        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-medium mb-6">
          <div className="flex items-center gap-1 text-primary">
            <Star className="w-4 h-4 fill-primary" /> 
            <span>{anime.score || "9.8"}</span>
          </div>
          <span className="text-gray-400">{anime.year || "2024"}</span> 
          <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] md:text-xs font-bold uppercase border border-primary/20">{anime.rating ? anime.rating.split(' ')[0] : '13+'}</span>
          <span className="border border-white/20 text-gray-300 px-2 py-0.5 rounded text-[10px] md:text-xs">Japan</span>
          <span className="border border-white/20 text-gray-300 px-2 py-0.5 rounded text-[10px] md:text-xs">Subtitle</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 mb-6">
          <button onClick={() => { setIsAdded(!isAdded); showToast(isAdded ? "Removed from list" : "Added to list"); }} className={`flex-shrink-0 flex flex-col items-center justify-center gap-1.5 transition-colors w-20 h-20 rounded-2xl border ${isAdded ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-[#1f222a] border-white/5 text-gray-300 hover:bg-[#2a2e39] hover:text-white'}`}>
            {isAdded ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            <span className="text-[10px] uppercase tracking-wider font-bold">{isAdded ? "Added" : "List"}</span>
          </button>
          <button onClick={() => {
            if (navigator.share) navigator.share({ title: anime.title, url: window.location.href }).catch(() => {});
            else { navigator.clipboard.writeText(window.location.href); showToast("Link copied to clipboard!"); }
          }} className="flex-shrink-0 flex flex-col items-center justify-center gap-1.5 bg-[#1f222a] border border-white/5 hover:bg-[#2a2e39] transition-colors text-gray-300 hover:text-white w-20 h-20 rounded-2xl">
            <Share2 className="w-6 h-6" />
            <span className="text-[10px] uppercase tracking-wider font-bold">Share</span>
          </button>
          <button onClick={() => showToast("Downloading Episode " + currentEpisode + "...")} className="flex-shrink-0 flex flex-col items-center justify-center gap-1.5 bg-[#1f222a] border border-white/5 hover:bg-[#2a2e39] transition-colors text-gray-300 hover:text-white w-20 h-20 rounded-2xl">
            <Download className="w-6 h-6" />
            <span className="text-[10px] uppercase tracking-wider font-bold">Save</span>
          </button>
        </div>

        {/* Resources & Episodes Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Episodes
              <span className="text-primary text-sm font-medium flex items-center cursor-pointer">
                Season 01 <ChevronDown className="w-4 h-4 ml-1" />
              </span>
            </h3>
          </div>

          {/* Episodes Scroll List */}
          <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0">
            {episodes.map(ep => (
              <button 
                key={ep}
                onClick={() => setCurrentEpisode(ep)}
                className={`flex-shrink-0 w-28 h-16 flex flex-col items-center justify-center rounded-xl transition-all ${ep === currentEpisode ? 'bg-primary text-white shadow-[0_0_15px_rgba(6,193,73,0.3)] border border-primary/50' : 'bg-[#1f222a] border border-white/5 text-gray-400 hover:bg-[#2a2e39] hover:text-white hover:border-white/10'}`}
              >
                <span className="text-xs font-medium opacity-80">Episode</span>
                <span className="text-lg font-bold">{ep.toString().padStart(2, '0')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations Header */}
        <div className="mt-8 mb-4">
          <h3 className="text-xl font-bold text-white flex items-center justify-between">
            More Like This
          </h3>
        </div>

        {/* Recommendations Grid */}
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 mb-10">
            {recommendations.slice(0, 7).map(rec => (
              <div 
                key={rec.mal_id} 
                className="group cursor-pointer relative"
                onClick={() => {
                  if (onSelectAnime) onSelectAnime(rec);
                }}
              >
                <div className="w-full aspect-[2/3] rounded-xl overflow-hidden relative border border-white/5 bg-[#0a0a0a] shadow-lg group-hover:border-primary/50 transition-colors">
                   {rec.images?.jpg?.large_image_url || rec.images?.jpg?.image_url ? (
                     <img src={rec.images.jpg.large_image_url || rec.images.jpg.image_url} alt={rec.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => { e.currentTarget.src = `https://placehold.co/400x600/0a0a0a/ffffff?text=${encodeURIComponent(rec.title)}`; }} />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center p-2">{rec.title}</div>
                   )}
                   <div className="absolute top-2 left-2 bg-primary px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-sm flex items-center gap-1 z-10">
                     {rec.score || "N/A"}
                   </div>
                </div>
                <h4 className="text-sm mt-2 line-clamp-2 font-medium text-white group-hover:text-primary transition-colors">{rec.title_english || rec.title}</h4>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center py-12 mb-10">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

      </div>
    </motion.div>
  );
};
