import { motion } from 'framer-motion';
import { Star, Clock, TrendingUp, Heart, ChevronRight } from 'lucide-react';
import useAppStore from '../store/appStore';
import { Movie } from '../types';

function MovieGridCard({ movie, index }: { movie: Movie; index: number }) {
  const { t, setSelectedMovie, setCurrentPage, isMovieSaved, addToSaved, removeFromSaved } = useAppStore();
  const inWatchlist = isMovieSaved(movie.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative glass rounded-2xl overflow-hidden hover:ring-1 hover:ring-primary-500/30 transition-all duration-300"
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
        <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center font-bold text-sm shadow-lg">
          {index + 1}
        </div>

        {/* Rating badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs font-medium">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          {movie.rating}
        </div>

        {/* Hover actions */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex gap-2">
          <motion.button
            onClick={() => {
              setSelectedMovie(movie);
              setCurrentPage('movie-detail');
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-sm font-medium transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="w-4 h-4" />
            Details
          </motion.button>
          <motion.button
            onClick={() => inWatchlist ? removeFromSaved(movie.id) : addToSaved(movie)}
                className={`p-2.5 rounded-xl transition-colors ${
                  inWatchlist ? 'bg-red-500/20 text-red-500' : 'bg-white/10 hover:bg-white/20'
                }`}
            whileTap={{ scale: 0.9 }}
          >
                {inWatchlist ? <Heart className="w-4 h-4 fill-red-500 text-red-500" /> : <Heart className="w-4 h-4" />}
              </motion.button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary-300 transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-dark-400">
          <span>{movie.year}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {movie.runtime} {t('movie.minutes')}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {movie.genres.slice(0, 2).map((g) => (
            <span key={g} className="px-2 py-0.5 rounded-full bg-primary-600/10 text-primary-400 text-[10px]">
              {g}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function TrendingPage() {
  const { t, trendingMovies } = useAppStore();

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light text-sm">
            <TrendingUp className="w-4 h-4 text-neon-pink" />
            <span className="text-dark-300">Updated in real-time</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black">
            <span className="text-gradient">{t('trending.title')}</span>
          </h1>
          <p className="text-dark-400 max-w-md mx-auto">{t('trending.subtitle')}</p>
        </motion.div>

        {/* Genre Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {['All', 'Action', 'Sci-Fi', 'Drama', 'Thriller', 'Comedy', 'Animation', 'Adventure'].map((genre, i) => (
            <button
              key={genre}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                i === 0
                  ? 'bg-primary-600/30 text-primary-300 ring-1 ring-primary-500/30'
                  : 'glass-light text-dark-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {genre}
            </button>
          ))}
        </motion.div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {trendingMovies.map((movie, i) => (
            <MovieGridCard key={movie.id} movie={movie} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
