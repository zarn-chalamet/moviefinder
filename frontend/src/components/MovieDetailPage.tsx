import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star, Clock, Calendar, Film, User, Users, ArrowLeft,
  Heart, Play, ExternalLink, Loader2,
  Sparkles, Info, Copy, Check, Search,
} from 'lucide-react';
import useAppStore from '../store/appStore';
import { movieService } from '../services/movieService';
import { Movie, StreamingProvider } from '../types';
import TelegramChannels from './TelegramChannels';
import {
  MM_SOURCES,
  TH_SOURCES,
  EN_SOURCES,
  WatchSource,
  buildSearchUrl,
} from '../data/streamingSources';

// ============================================
// Main Component
// ============================================

export default function MovieDetailPage() {
  const { 
    t, selectedMovie, setCurrentPage, isMovieSaved, 
    addToSaved, removeFromSaved, setSelectedMovie, language 
  } = useAppStore();

  const [streamingProviders, setStreamingProviders] = useState<StreamingProvider[]>([]);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [isLoadingStreaming, setIsLoadingStreaming] = useState(false);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [activeTab, setActiveTab] = useState<'my' | 'th' | 'en'>('my');
  const [copiedTitle, setCopiedTitle] = useState(false);

  if (!selectedMovie) {
    setCurrentPage('home');
    return null;
  }

  const movie = selectedMovie;
  const movieId = movie.tmdbId || movie.id;
  const inWatchlist = isMovieSaved(movie.id);

  // Fetch real streaming data and similar movies
  useEffect(() => {
    if (!movieId) return;

    setIsLoadingStreaming(true);
    movieService.getStreamingProviders(movieId, 'TH')
      .then(setStreamingProviders)
      .catch((err) => {
        console.error('Failed to fetch streaming:', err);
        setStreamingProviders([]);
      })
      .finally(() => setIsLoadingStreaming(false));

    setIsLoadingSimilar(true);
    movieService.getSimilarMovies(movieId, 6)
      .then(setSimilarMovies)
      .catch((err) => {
        console.error('Failed to fetch similar movies:', err);
        setSimilarMovies([]);
      })
      .finally(() => setIsLoadingSimilar(false));
  }, [movieId]);

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(movie.title);
    setCopiedTitle(true);
    setTimeout(() => setCopiedTitle(false), 2000);
  };

  // Filter TMDB providers by type - ONLY REAL DATA
  const paidProviders = streamingProviders.filter(p => 
    p.type === 'subscription' || p.type === 'rent' || p.type === 'buy'
  );
  const freeProviders = streamingProviders.filter(p => p.type === 'free');

  const displayTitle = language === 'th' && movie.titleTh
    ? movie.titleTh
    : language === 'my' && movie.titleMy
    ? movie.titleMy
    : movie.title;

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Backdrop */}
      <div className="relative h-[45vh] sm:h-[55vh]">
        <img
          src={movie.backdropUrl}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/70 to-dark-950/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950/90 to-transparent" />

        <motion.button
          onClick={() => setCurrentPage('chat')}
          className="absolute top-20 left-4 sm:left-8 p-2.5 rounded-xl glass hover:bg-white/10 transition-colors z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 relative z-10">
        {/* Movie Header */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 mx-auto md:mx-0"
          >
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-40 sm:w-48 md:w-56 lg:w-64 rounded-2xl shadow-2xl shadow-black/50"
            />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 space-y-4 md:space-y-5"
          >
            <div>
              <div className="group/title inline-flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black leading-tight">
                  {displayTitle}
                </h1>
                <motion.button
                  onClick={handleCopyTitle}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass hover:bg-white/10 transition-all self-center ${
                    copiedTitle 
                      ? 'opacity-100' 
                      : 'opacity-0 group-hover/title:opacity-100 focus:opacity-100'
                  }`}
                  whileTap={{ scale: 0.9 }}
                  title={t('movie.copyTitle')}
                >
                  {copiedTitle ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-xs text-green-400 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-dark-300" />
                      <span className="text-xs text-dark-300 font-medium">Copy</span>
                    </>
                  )}
                </motion.button>
              </div>
              {displayTitle !== movie.title && (
                <p className="text-dark-400 text-base sm:text-lg mt-1">{movie.title}</p>
              )}
              {movie.tagline && (
                <p className="text-primary-400 italic mt-2 text-sm sm:text-base">"{movie.tagline}"</p>
              )}
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {movie.rating > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 text-yellow-400 font-semibold">
                  <Star className="w-4 h-4 fill-yellow-400" />
                  {movie.rating}/10
                  <span className="text-dark-500 font-normal text-xs">
                    ({movie.voteCount.toLocaleString()})
                  </span>
                </div>
              )}
              {movie.year && (
                <div className="flex items-center gap-1.5 text-dark-300">
                  <Calendar className="w-4 h-4 text-dark-500" />
                  {movie.year}
                </div>
              )}
              {movie.runtime > 0 && (
                <div className="flex items-center gap-1.5 text-dark-300">
                  <Clock className="w-4 h-4 text-dark-500" />
                  {movie.runtime} {t('movie.minutes')}
                </div>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <span 
                    key={g} 
                    className="px-3 py-1 rounded-full bg-primary-600/15 text-primary-300 text-xs sm:text-sm font-medium border border-primary-500/10"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <motion.a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' official trailer')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 font-semibold text-sm shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Play className="w-4 h-4" />
                {t('movie.trailer')}
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </motion.a>
              <motion.button
                onClick={() => inWatchlist ? removeFromSaved(movie.id) : addToSaved(movie)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  inWatchlist
                    ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                    : 'glass hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {inWatchlist ? (
                  <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                ) : (
                  <Heart className="w-4 h-4" />
                )}
                {inWatchlist ? t('movie.saved') : t('movie.saveMovie')}
              </motion.button>
            </div>

            {/* Cast & Director */}
            <div className="space-y-2.5">
              {movie.director && (
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-dark-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-dark-500 font-medium uppercase tracking-wider">
                      {t('movie.director')}
                    </p>
                    <p className="text-sm text-dark-200 truncate">{movie.director}</p>
                  </div>
                </div>
              )}
              {movie.cast && movie.cast.length > 0 && (
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-dark-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-dark-500 font-medium uppercase tracking-wider">
                      {t('movie.cast')}
                    </p>
                    <p className="text-sm text-dark-200">{movie.cast.join(', ')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Overview */}
            {movie.overview && (
              <div>
                <h3 className="text-xs text-dark-500 font-medium uppercase tracking-wider mb-2">
                  {t('movie.overview')}
                </h3>
                <p className="text-dark-300 leading-relaxed text-sm sm:text-base">
                  {language === 'th' && movie.overviewTh ? movie.overviewTh : movie.overview}
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* ============================================
            FIND MOVIE SECTION - Honest Framing
        ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 space-y-6"
        >
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full" />
            <div>
              <h2 className="text-2xl font-bold">{t('movie.findTitle')}</h2>
              <p className="text-sm text-dark-400 mt-0.5">{t('movie.findSubtitle')}</p>
            </div>
          </div>

          {/* Copy Title Hint */}
          <div className="glass rounded-xl p-3 border border-primary-500/10">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-dark-300">{t('movie.searchTip')}</p>
                <button
                  onClick={handleCopyTitle}
                  className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors"
                >
                  {copiedTitle ? (
                    <>
                      <Check className="w-3 h-3" />
                      {t('movie.copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      "{movie.title}"
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: Verified TMDB Streaming (Only Real Data) */}
          {(paidProviders.length > 0 || freeProviders.length > 0) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {t('movie.verifiedTitle')}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 font-medium border border-green-500/20">
                      TMDB
                    </span>
                  </h3>
                  <p className="text-xs text-dark-400">{t('movie.verifiedSubtitle')}</p>
                </div>
              </div>

              {isLoadingStreaming ? (
                <div className="flex items-center gap-2 p-4 glass rounded-xl">
                  <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
                  <p className="text-sm text-dark-300">Checking availability...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[...freeProviders, ...paidProviders].map((p, i) => (
                    <TMDBProviderCard 
                      key={`${p.platform}-${i}`} 
                      provider={p} 
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 2: Search Free Sites (Curated with Language Tabs) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <Search className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t('movie.searchFreeTitle')}</h3>
                <p className="text-xs text-dark-400">{t('movie.searchFreeSubtitle')}</p>
              </div>
            </div>

            {/* Language Tabs */}
            <div className="flex gap-2 border-b border-white/5 overflow-x-auto scrollbar-hide">
              <TabButton
                active={activeTab === 'my'}
                onClick={() => setActiveTab('my')}
                flag="🇲🇲"
                label="Myanmar"
                sublabel="မြန်မာ"
              />
              <TabButton
                active={activeTab === 'th'}
                onClick={() => setActiveTab('th')}
                flag="🇹🇭"
                label="Thai"
                sublabel="ภาษาไทย"
              />
              <TabButton
                active={activeTab === 'en'}
                onClick={() => setActiveTab('en')}
                flag="🌍"
                label="Global"
                sublabel="English"
              />
            </div>

            {/* Sources Grid */}
            <div className="pt-2">
              {activeTab === 'my' && (
                <SourcesGrid sources={MM_SOURCES} movieTitle={movie.title} />
              )}
              {activeTab === 'th' && (
                <SourcesGrid sources={TH_SOURCES} movieTitle={movie.title} />
              )}
              {activeTab === 'en' && (
                <SourcesGrid sources={EN_SOURCES} movieTitle={movie.title} />
              )}
            </div>
          </div>

          {/* Section 3: Telegram Channels (Myanmar users love this) */}
          {activeTab === 'my' && (
            <TelegramChannels
              movieTitle={movie.title}
              originalLanguage={movie.originalTitle ? 'ko' : undefined}
              genres={movie.genres}
            />
          )}

          {/* Empty State - Only shown when no TMDB streaming */}
          {!isLoadingStreaming && paidProviders.length === 0 && freeProviders.length === 0 && (
            <div className="p-4 glass rounded-xl border border-yellow-500/20">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-300 font-medium">
                    {t('movie.notOnPremium')}
                  </p>
                  <p className="text-xs text-dark-400 mt-1">
                    {t('movie.notOnPremiumDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* ============================================
            SIMILAR MOVIES
        ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 pb-16 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                {t('movie.similar')}
              </h2>
              <p className="text-sm text-dark-400 mt-0.5">Movies you might also enjoy</p>
            </div>
          </div>

          {isLoadingSimilar ? (
            <div className="flex items-center justify-center gap-2 p-8 glass rounded-xl">
              <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
              <p className="text-sm text-dark-300">Finding similar movies...</p>
            </div>
          ) : similarMovies.length === 0 ? (
            <div className="p-8 glass rounded-xl text-center">
              <Film className="w-12 h-12 text-dark-600 mx-auto mb-3" />
              <p className="text-sm text-dark-400">No similar movies found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {similarMovies.map((m, idx) => (
                <motion.button
                  key={m.id}
                  onClick={() => {
                    setSelectedMovie(m);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.05 }}
                  className="group glass rounded-xl overflow-hidden hover:ring-1 hover:ring-primary-500/40 transition-all text-left"
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="aspect-[2/3] overflow-hidden bg-dark-800">
                    {m.posterUrl ? (
                      <img
                        src={m.posterUrl}
                        alt={m.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-12 h-12 text-dark-600" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold line-clamp-1">{m.title}</p>
                    <div className="flex items-center gap-2 text-xs text-dark-400 mt-1">
                      {m.rating > 0 && (
                        <span className="flex items-center gap-0.5 text-yellow-400">
                          <Star className="w-3 h-3 fill-yellow-400" />
                          {m.rating.toFixed(1)}
                        </span>
                      )}
                      {m.year && <span>{m.year}</span>}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ============================================
// Sub Components
// ============================================

function TabButton({
  active, onClick, flag, label, sublabel,
}: {
  active: boolean;
  onClick: () => void;
  flag: string;
  label: string;
  sublabel: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative flex flex-col items-start px-4 sm:px-6 py-3 transition-colors whitespace-nowrap ${
        active ? 'text-white' : 'text-dark-400 hover:text-dark-200'
      }`}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{flag}</span>
        <span className="font-semibold text-sm">{label}</span>
      </div>
      <span className="text-xs text-dark-500 mt-0.5">{sublabel}</span>
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500"
          initial={false}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </motion.button>
  );
}

function SourcesGrid({
  sources,
  movieTitle,
}: {
  sources: WatchSource[];
  movieTitle: string;
}) {
  const { t } = useAppStore();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {sources.map((source, idx) => (
        <motion.a
          key={source.name}
          href={buildSearchUrl(source, movieTitle)}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 p-3.5 rounded-xl glass hover:bg-white/5 hover:ring-1 hover:ring-primary-500/30 transition-all cursor-pointer"
          whileHover={{ scale: 1.02, y: -2 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <div className="w-11 h-11 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-xl">
            {source.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{source.name}</p>
            <p className="text-xs text-dark-400 truncate">{source.description}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-[10px] text-primary-400 font-medium hidden sm:inline">
              {t('movie.searchButton')}
            </span>
            <Search className="w-4 h-4 text-dark-500 group-hover:text-primary-400 transition-colors" />
          </div>
        </motion.a>
      ))}
    </div>
  );
}

function TMDBProviderCard({ provider }: { provider: StreamingProvider }) {
  const isFree = provider.isFree;
  
  return (
    <motion.a
      href={provider.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center justify-between p-3.5 rounded-xl glass transition-all cursor-pointer ${
        isFree 
          ? 'border border-green-500/20 hover:border-green-500/40 hover:bg-green-500/5'
          : 'border border-primary-500/20 hover:border-primary-500/40 hover:bg-primary-500/5'
      }`}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {provider.logo && provider.logo.startsWith('http') ? (
          <img 
            src={provider.logo} 
            alt={provider.platform}
            className="w-11 h-11 rounded-lg object-contain bg-white/5 p-1 flex-shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🎬</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{provider.platform}</p>
          <p className="text-xs text-dark-400 capitalize">{provider.type}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-xs font-semibold ${isFree ? 'text-green-400' : 'text-primary-300'}`}>
          {provider.price}
        </span>
        <ExternalLink className={`w-4 h-4 transition-colors ${
          isFree ? 'text-dark-500 group-hover:text-green-400' : 'text-dark-500 group-hover:text-primary-400'
        }`} />
      </div>
    </motion.a>
  );
}