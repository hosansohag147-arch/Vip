import { motion } from "motion/react";
import { Crown, Play, Star, Sparkles, ChevronRight, Loader2, MonitorPlay, Lock, Unlock, Search, Bookmark, User, Home, Calendar, Download, Menu, Settings, Mic } from "lucide-react";
import { TiltCard } from "./components/TiltCard";
import { useState, useEffect } from "react";
import { Anime } from "./types";
import { PlayerView } from "./views/PlayerView";
import { DetailsView } from "./views/DetailsView";
import { GenresView } from "./views/GenresView";
import { WatchlistView } from "./views/WatchlistView";
import { SettingsView } from "./views/SettingsView";
import { DownloadView } from "./views/DownloadView";

import { CalendarView } from "./views/CalendarView";
import { SearchView } from "./views/SearchView";

import AnimeGrid from "./components/AnimeGrid";
import AnimePlayer from "./components/AnimePlayer";

const AnimeGridRow = ({ title, subtitle, animes, onSelectAnime, onSeeAll }: { title: string, subtitle: string, animes: Anime[], onSelectAnime?: (anime: Anime) => void, onSeeAll?: () => void }) => {
  if (!animes || animes.length === 0) return null;
  
  return (
    <section className="relative z-10 w-full px-4 md:px-8 lg:px-12 mx-auto pb-8">
      <div className="flex items-center justify-between mb-4 gap-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <button onClick={onSeeAll} className="text-primary font-medium flex items-center hover:translate-x-1 transition-transform text-sm">
          See all
        </button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-4 snap-x snap-mandatory">
        {animes.map((anime, idx) => {
          return (
            <motion.div
              key={anime.mal_id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "50px" }}
              transition={{ delay: (idx % 10) * 0.05, duration: 0.5, ease: "easeOut" }}
              className="group flex flex-col cursor-pointer w-36 md:w-48 flex-shrink-0 snap-start"
              onClick={() => onSelectAnime && onSelectAnime(anime)}
            >
              <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#0a0a0a] transition-all duration-300 shadow-lg group-hover:border-primary/50 w-full aspect-[2/3] mb-2">
                <img
                  src={anime.images.jpg.large_image_url}
                  alt={anime.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = `https://placehold.co/400x600/0a0a0a/ffffff?text=${encodeURIComponent(anime.title)}`; }}
                />
                
                {/* Rating Badge */}
                <div className="absolute top-2 left-2 bg-primary px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-sm flex items-center gap-1 z-10">
                  {anime.score || "N/A"}
                </div>
              </div>
              
              {/* Title & Authentic Name */}
              <div className="px-1 flex-shrink-0">
                <h3 className="font-bold text-white line-clamp-2 transition-colors group-hover:text-primary text-sm" title={anime.title_english || anime.title}>
                  {anime.title_english || anime.title}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

// View Components
const TheatreView = ({ featured, animes }: { featured: Anime | null, animes: Anime[] }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 pb-32">
      <div className="flex items-center gap-3 mb-8">
        <MonitorPlay className="w-8 h-8 text-primary" />
        <h1 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-widest text-white">VIP <span className="text-primary">THEATRE</span></h1>
      </div>
      
      {featured && (
        <div className="w-full aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden border border-primary/30 shadow-[0_0_50px_rgba(6,193,73,0.2)] bg-black relative mb-16 group">
          <img src={featured.images.jpg.large_image_url} className="w-full h-full object-cover opacity-50 transition-transform duration-[10s] group-hover:scale-105" onError={(e) => { e.currentTarget.src = `https://placehold.co/1200x500/0a0a0a/ffffff?text=${encodeURIComponent(featured.title)}`; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8 md:p-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-red-600 font-bold text-[10px] tracking-widest uppercase rounded text-white shadow-lg shadow-red-500/20">Live Event</span>
              <span className="text-gray-300 text-sm font-medium">8K Ultra HD Stream</span>
            </div>
            <h2 className="text-3xl md:text-6xl font-display font-bold mb-4 drop-shadow-lg text-white">{featured.title_english || featured.title}</h2>
            <p className="text-gray-300 max-w-3xl mb-8 line-clamp-2 md:line-clamp-3 md:text-lg">{featured.synopsis}</p>
            <div className="flex gap-4">
              <button className="bg-primary text-black px-6 py-3 md:px-8 md:py-4 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_30px_rgba(6,193,73,0.4)] whitespace-nowrap">
                <Play className="fill-black w-5 h-5"/> ENTER THEATRE ROOM
              </button>
            </div>
          </div>
        </div>
      )}
      
      <AnimeGridRow title="NOW PLAYING IN ARENA" subtitle="Live synchronous watch parties in VR/3D" animes={animes.slice(0, 14)} />
    </motion.div>
  );
};

const ExclusiveView = ({ animes }: { animes: Anime[] }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 pb-32">
       <div className="flex items-center gap-3 mb-4 text-primary">
         <Crown className="w-8 h-8" />
         <h1 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-widest text-white">THE <span className="text-primary">VAULT</span></h1>
       </div>
       <p className="text-gray-400 max-w-2xl mb-12 md:text-lg font-light">Uncensored director's cuts, 8K remasters, and unreleased OVAs locked securely in the VIP Vault.</p>
       
       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
         {animes.map((anime, idx) => (
            <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-primary/40 group cursor-pointer bg-black">
              <img src={anime.images.jpg.large_image_url} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-90 transition-all duration-700 blur-[3px] group-hover:blur-0" onError={(e) => { e.currentTarget.src = `https://placehold.co/400x600/0a0a0a/ffffff?text=${encodeURIComponent(anime.title)}`; }} />
              
              <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/60 group-hover:bg-black/20 transition-colors duration-500">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/80 backdrop-blur-md border border-primary flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,193,73,0.4)] transition-transform group-hover:scale-110">
                  <Lock className="w-6 h-6 md:w-8 md:h-8 text-primary opacity-100 group-hover:hidden" />
                  <Unlock className="w-6 h-6 md:w-8 md:h-8 text-primary hidden group-hover:block drop-shadow-[0_0_10px_rgba(6,193,73,0.8)]" />
                </div>
                <span className="font-bold text-center px-4 font-display text-white group-hover:text-primary drop-shadow-md text-sm md:text-base mb-1 line-clamp-2">{anime.title_english || anime.title}</span>
                <span className="text-[10px] uppercase tracking-widest text-primary/80 bg-primary/10 px-2 py-0.5 rounded border border-primary/20 mt-1">Classified</span>
              </div>
            </div>
         ))}
       </div>
    </motion.div>
  );
};

export default function App() {
  const [heroAnime, setHeroAnime] = useState<Anime | null>(null);
  const [airingAnimes, setAiringAnimes] = useState<Anime[]>([]);
  const [topAnimes, setTopAnimes] = useState<Anime[]>([]);
  const [upcomingAnimes, setUpcomingAnimes] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'mylist' | 'download' | 'profile' | 'details' | 'player' | 'search' | 'hindi' | 'hindi-player'>('home');
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [selectedHindiAnime, setSelectedHindiAnime] = useState<any>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectAnime = (anime: Anime) => {
    setSelectedAnime(anime);
    setActiveTab('details'); // first go to details
  };

  const handleSelectHindiAnime = (anime: any) => {
    setSelectedHindiAnime(anime);
    setActiveTab('hindi-player');
  };

  const handlePlayAnime = (episodeId: number) => {
    setSelectedEpisode(episodeId);
    setActiveTab('player'); // then open video player
  };

  useEffect(() => {
    let isMounted = true;

    const fetchSection = async (url: string) => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Network err');
        const data = await res.json();
        return data.data || [];
      } catch (err) {
        console.error(err);
        return [];
      }
    };

    const loadAll = async () => {
      setIsLoading(true);
      
      const seenIds = new Set<number>();
      
      const airing = await fetchSection('https://api.jikan.moe/v4/seasons/now?limit=25');
      if (!isMounted) return;
      
      const uniqueAiring = airing.filter((a: Anime) => {
        if (seenIds.has(a.mal_id)) return false;
        seenIds.add(a.mal_id);
        return true;
      });

      if (uniqueAiring.length > 0) {
        setHeroAnime(uniqueAiring[0]);
        setAiringAnimes(uniqueAiring.slice(1, 21));
      }
      
      setIsLoading(false); // Pop UI immediately once hero is loaded
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      const top = await fetchSection('https://api.jikan.moe/v4/top/anime?limit=25');
      if (!isMounted) return;
      
      const uniqueTop = top.filter((a: Anime) => {
        if (seenIds.has(a.mal_id)) return false;
        seenIds.add(a.mal_id);
        return true;
      });
      setTopAnimes(uniqueTop.slice(0, 20));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      const upcoming = await fetchSection('https://api.jikan.moe/v4/seasons/upcoming?limit=25');
      if (!isMounted) return;
      
      const uniqueUpcoming = upcoming.filter((a: Anime) => {
        if (seenIds.has(a.mal_id)) return false;
        seenIds.add(a.mal_id);
        return true;
      });
      setUpcomingAnimes(uniqueUpcoming.slice(0, 20));
    };
    
    loadAll();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-grid z-0 opacity-40 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary opacity-[0.05] blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-primary text-white font-bold px-6 py-3 rounded-full text-sm shadow-[0_0_20px_rgba(6,193,73,0.5)] border border-white/20 pointer-events-none transition-all duration-300">
          {toastMessage}
        </div>
      )}

      {/* Top Navbar */}
      {activeTab !== 'player' && activeTab !== 'search' && activeTab !== 'details' && activeTab !== 'hindi-player' && (
        <nav className="relative z-10 w-full mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 cursor-pointer transition-transform hover:scale-105" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
               <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Good Morning 👋</p>
              <h2 className="text-white font-bold text-sm">Andrew Ainsley</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('hindi')} className={`hover:text-primary transition-colors text-white flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full text-xs font-bold`}>
              <Mic className="w-4 h-4 text-violet-400" />
              <span>Hindi Dub</span>
            </button>
            <button onClick={() => setActiveTab('search')} className={`hover:text-primary transition-colors text-white`}>
              <Search className="w-6 h-6" />
            </button>
            <button onClick={() => setActiveTab('profile')} className={`hover:text-primary transition-colors text-white`}>
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <div className={`pb-20 ${activeTab === 'player' ? 'pb-0' : ''}`}>
        {isLoading ? (
          <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
            <>

              {/* Hero Section */}
              {heroAnime && (
                <main className="relative z-10 w-full mb-8">
                  <div className="relative w-full aspect-[4/5] md:aspect-[21/9]">
                    <div className="absolute inset-0">
                      <img src={heroAnime.images.jpg.large_image_url} alt={heroAnime.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = `https://placehold.co/800x1200/0a0a0a/ffffff?text=${encodeURIComponent(heroAnime.title)}`; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#181a20] via-black/40 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#181a20] via-black/40 to-transparent hidden md:block" />
                    </div>
                    
                    <div className="absolute bottom-6 left-6 right-6 md:left-12 lg:left-20 flex flex-col justify-end">
                      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 line-clamp-2 md:max-w-2xl text-shadow-lg drop-shadow-md">
                        {heroAnime.title_english || heroAnime.title}
                      </h1>
                      <div className="flex items-center gap-2 text-xs md:text-sm text-gray-300 mb-4">
                        <span className="text-gray-400">Action, Shounen, Martial Arts</span>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => { handleSelectAnime(heroAnime); handlePlayAnime(1); }} className="bg-primary text-white hover:bg-primary/90 px-6 py-2.5 rounded-full font-semibold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
                          <Play className="w-4 h-4 fill-white text-white" />
                          <span>Play</span>
                        </button>
                        <button onClick={() => showToast("Added to My List")} className="border border-white text-white hover:bg-white/10 px-6 py-2.5 rounded-full font-semibold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
                          <span className="text-xl leading-none">+</span>
                          <span>My List</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </main>
              )}

              {/* Grids */}
              <AnimeGridRow title="Top Hits Anime" subtitle="" animes={topAnimes} onSelectAnime={handleSelectAnime} onSeeAll={() => setActiveTab('search')} />
              
              <AnimeGridRow title="New Episode Releases" subtitle="" animes={airingAnimes} onSelectAnime={handleSelectAnime} onSeeAll={() => setActiveTab('search')} />
              
              <AnimeGridRow title="Upcoming Releases" subtitle="" animes={upcomingAnimes} onSelectAnime={handleSelectAnime} onSeeAll={() => setActiveTab('search')} />
            </>
          )}

          {activeTab === 'search' && (
            <SearchView animes={[...topAnimes, ...airingAnimes]} onBack={() => setActiveTab('home')} onSelectAnime={handleSelectAnime} />
          )}

          {activeTab === 'theatre' && (
            <TheatreView featured={airingAnimes[1] || topAnimes[0] || heroAnime} animes={topAnimes} />
          )}

          {activeTab === 'exclusive' && (
            <ExclusiveView animes={[...upcomingAnimes].reverse()} />
          )}

          {activeTab === 'genres' && (
            <GenresView onSelectAnime={handleSelectAnime} />
          )}

          {activeTab === 'mylist' && (
            <WatchlistView onSelectAnime={handleSelectAnime} onSearch={() => setActiveTab('search')} />
          )}

          {activeTab === 'profile' && (
            <SettingsView />
          )}

          {activeTab === 'download' && (
            <DownloadView onSearch={() => setActiveTab('search')} />
          )}

          {activeTab === 'calendar' && (
            <CalendarView animes={airingAnimes} onSelectAnime={handleSelectAnime} onSearch={() => setActiveTab('search')} />
          )}

          {activeTab === 'details' && selectedAnime && (
            <DetailsView anime={selectedAnime} onBack={() => setActiveTab('home')} onPlay={handlePlayAnime} />
          )}

          {activeTab === 'player' && selectedAnime && (
            <PlayerView anime={selectedAnime} episodeId={selectedEpisode} onBack={() => setActiveTab('details')} onSelectAnime={handleSelectAnime} />
          )}

          {activeTab === 'hindi' && (
            <AnimeGrid onSelect={handleSelectHindiAnime} />
          )}

          {activeTab === 'hindi-player' && selectedHindiAnime && (
            <AnimePlayer anime={selectedHindiAnime} onBack={() => setActiveTab('hindi')} />
          )}
        </>
      )}
      </div>

      {/* Bottom Navigation */}
      {activeTab !== 'player' && activeTab !== 'details' && activeTab !== 'hindi-player' && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#181a20]/90 backdrop-blur-md border-t border-white/5 pb-5 pt-3 px-6 z-50 rounded-t-3xl sm:max-w-full sm:rounded-none">
          <div className="flex justify-between items-center text-xs text-gray-500 max-w-md mx-auto">
            <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-primary' : 'hover:text-gray-300'}`}>
              <Home className="w-5 h-5" />
              <span>Home</span>
            </button>
            <button onClick={() => setActiveTab('calendar')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'calendar' ? 'text-primary' : 'hover:text-gray-300'}`}>
              <Calendar className="w-5 h-5" />
              <span>Release Ca..</span>
            </button>
            <button onClick={() => setActiveTab('mylist')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'mylist' ? 'text-primary' : 'hover:text-gray-300'}`}>
              <Bookmark className="w-5 h-5" />
              <span>My List</span>
            </button>
            <button onClick={() => setActiveTab('download')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'download' ? 'text-primary' : 'hover:text-gray-300'}`}>
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>
            <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-primary' : 'hover:text-gray-300'}`}>
              <User className="w-5 h-5" />
              <span>Profile</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

