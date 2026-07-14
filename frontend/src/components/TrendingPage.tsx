import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, TrendingUp, Heart, ChevronRight, Loader2 } from 'lucide-react';
import useAppStore from '../store/appStore';
import { Movie } from '../types';

const GENRES = [
  { value: 'All', labelKey: 'genre.all' },
  { value: 'Action', labelKey: 'genre.action' },
  { value: 'Sci-Fi', labelKey: 'genre.scifi' },
  { value: 'Drama', labelKey: 'genre.drama' },
  { value: 'Thriller', labelKey: 'genre.thriller' },
  { value: 'Comedy', labelKey: 'genre.comedy' },
  { value: 'Animation', labelKey: 'genre.animation' },
  { value: 'Adventure', labelKey: 'genre.adventure' },
];

function MovieGridCard({ movie, index, originalRank }: { movie: Movie; index: number; originalRank: number }) {
  const { t, setSelectedMovie, setCurrentPage, isMovieSaved, addToSaved, removeFromSaved } = useAppStore();
  const movieId = movie.tmdbId || movie.id;
  const inWatchlist = isMovieSaved(movieId);

  const handleCardClick = () => {
    setSelectedMovie(movie);
    setCurrentPage('movie-detail');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      onClick={handleCardClick}
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

        {/* Rank badge */}
        <div className="absolute top-2.5 left-2.5 min-w-[28px] h-7 px-1.5 rounded-lg bg-dark-950/80 backdrop-blur-sm border border-white/10 flex items-center justify-center font-mono text-xs font-semibold text-dark-200">
          #{originalRank}
        </div>

        {/* Rating badge */}
        {movie.rating > 0 && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg bg-dark-950/80 backdrop-blur-sm border border-white/10 text-xs font-medium text-dark-200">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {movie.rating.toFixed(1)}
          </div>
        )}

        {/* Save button — stops propagation so card click doesn't fire */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            inWatchlist ? removeFromSaved(movieId) : addToSaved(movie);
          }}
          className={`absolute bottom-2.5 right-2.5 p-2 rounded-full border transition-all duration-300 z-10
            md:opacity-0 md:group-hover:opacity-100 md:translate-y-1 md:group-hover:translate-y-0
            ${inWatchlist
              ? 'bg-red-500/20 border-red-500/30 text-red-400'
              : 'bg-dark-950/80 border-white/10 text-dark-300 hover:text-white hover:border-white/20'
            }`}
        >
          <Heart className={`w-3.5 h-3.5 ${inWatchlist ? 'fill-red-400' : ''}`} />
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
}

export default function TrendingPage() {
  const { t, trendingMovies, isTrendingLoading, loadTrendingMovies, language } = useAppStore();
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  useEffect(() => {
    loadTrendingMovies();
  }, [language]);

  const filteredMovies = useMemo(() => {
    if (selectedGenre === 'All') return trendingMovies;
    return trendingMovies.filter((movie) =>
      movie.genres?.some(
        (g) =>
          g.toLowerCase().includes(selectedGenre.toLowerCase()) ||
          selectedGenre.toLowerCase().includes(g.toLowerCase())
      )
    );
  }, [trendingMovies, selectedGenre]);

  // Map filtered movies to their original trending rank
  const getOriginalRank = (movie: Movie) => {
    const movieId = movie.tmdbId || movie.id;
    return trendingMovies.findIndex((m) => (m.tmdbId || m.id) === movieId) + 1;
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
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
            <TrendingUp className="w-3.5 h-3.5 text-primary-400" strokeWidth={1.5} />
            {t('trending.badge')}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[0.95] mb-4">
            {t('trending.title')}
          </h1>

          <p className="text-lg text-dark-400 max-w-xl leading-relaxed">
            {t('trending.subtitle')}
          </p>
        </motion.div>

        {/* ============================================
            Genre Filters
        ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-wrap gap-2 mb-12"
        >
          {GENRES.map((genre) => (
            <button
              key={genre.value}
              onClick={() => setSelectedGenre(genre.value)}
              className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedGenre === genre.value
                  ? 'text-white bg-white/5 border border-white/10'
                  : 'text-dark-400 hover:text-white border border-transparent hover:border-white/5'
              }`}
            >
              {t(genre.labelKey)}
            </button>
          ))}
        </motion.div>

        {/* ============================================
            Movie Grid
        ============================================ */}
        {isTrendingLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-6 h-6 text-dark-500 animate-spin" />
            <p className="text-sm text-dark-500">{t('common.loading')}</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-dark-400">{t('trending.emptyGenre')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-5">
            {filteredMovies.map((movie, i) => (
              <MovieGridCard
                key={movie.tmdbId || movie.id}
                movie={movie}
                index={i}
                originalRank={getOriginalRank(movie)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}