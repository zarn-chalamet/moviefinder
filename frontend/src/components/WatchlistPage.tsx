import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Clock, Trash2, Film, ArrowRight } from 'lucide-react';
import useAppStore from '../store/appStore';
import { WatchlistItem } from '../types';

export default function WatchlistPage() {
  const { t, savedMovies, removeFromSaved, setSelectedMovie, setCurrentPage } = useAppStore();

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* ============================================
            Header
        ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-xs text-dark-300 mb-6">
            <Heart className="w-3.5 h-3.5 text-primary-400" strokeWidth={1.5} />
            {savedMovies.length === 0
              ? t('watchlist.empty').split('.')[0]
              : `${savedMovies.length} ${savedMovies.length > 1 ? 'movies' : 'movie'} saved`}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[0.95] mb-4">
            {t('watchlist.title')}
          </h1>

          <p className="text-lg text-dark-400 max-w-xl leading-relaxed">
            {t('watchlist.subtitle')}
          </p>
        </motion.div>

        {/* ============================================
            Empty State
        ============================================ */}
        {savedMovies.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="py-24 text-center"
          >
            <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center mx-auto mb-6">
              <Film className="w-7 h-7 text-dark-500" strokeWidth={1.5} />
            </div>

            <p className="text-dark-400 mb-8 max-w-sm mx-auto">
              {t('watchlist.empty')}
            </p>

            <button
              onClick={() => setCurrentPage('chat')}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-dark-950 font-semibold text-sm hover:bg-dark-200 transition-colors"
            >
              {t('hero.cta')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>
        )}

        {/* ============================================
            Saved Movies Grid
        ============================================ */}
        {savedMovies.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            <AnimatePresence mode="popLayout">
              {savedMovies.map((item: WatchlistItem, i: number) => {
                const movie = item.movie;
                const movieId = movie.tmdbId || movie.id;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                    onClick={() => {
                      setSelectedMovie(movie);
                      setCurrentPage('movie-detail');
                    }}
                    className="group relative rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden hover:border-white/10 transition-all duration-300 cursor-pointer"
                  >
                    {/* Poster */}
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Saved badge */}
                      <div className="absolute top-2.5 left-2.5 p-1.5 rounded-lg bg-dark-950/80 backdrop-blur-sm border border-red-500/30">
                        <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                      </div>

                      {/* Rating badge */}
                      {movie.rating > 0 && (
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg bg-dark-950/80 backdrop-blur-sm border border-white/10 text-xs font-medium text-dark-200">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {movie.rating.toFixed(1)}
                        </div>
                      )}

                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromSaved(movieId);
                        }}
                        className="absolute bottom-2.5 right-2.5 p-2 rounded-full border border-white/10 bg-dark-950/80 text-dark-400 hover:text-red-400 hover:border-red-500/30 transition-all duration-300 z-10
                          md:opacity-0 md:group-hover:opacity-100 md:translate-y-1 md:group-hover:translate-y-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-1 tracking-tight group-hover:text-white transition-colors">
                        {movie.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-dark-500">
                        <span className="font-mono">{movie.year || '—'}</span>
                        {movie.runtime > 0 ? (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {movie.runtime} {t('movie.minutes')}
                          </span>
                        ) : movie.rating > 0 ? (
                          <span className="flex items-center gap-1 text-dark-500">
                            <Star className="w-3 h-3" />
                            {movie.voteCount?.toLocaleString() || 0}
                          </span>
                        ) : null}
                      </div>
                      {movie.genres && movie.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {movie.genres.slice(0, 2).map((g) => (
                            <span
                              key={g}
                              className="px-2 py-0.5 rounded-full border border-white/5 bg-white/[0.02] text-[10px] text-dark-400"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}