import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Clock, Trash2, ChevronRight, Film } from 'lucide-react';
import useAppStore from '../store/appStore';
import { WatchlistItem } from '../types';

export default function WatchlistPage() {
  const { t, savedMovies, removeFromSaved, setSelectedMovie, setCurrentPage } = useAppStore();

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 space-y-4"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mx-auto shadow-lg shadow-red-500/30"
          >
            <Heart className="w-8 h-8 text-white fill-white" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-black">
            <span className="text-gradient">Saved Movies</span>
          </h1>
          <p className="text-dark-400">
            {savedMovies.length === 0
              ? 'No saved movies yet'
              : `${savedMovies.length} movie${savedMovies.length > 1 ? 's' : ''} saved`}
          </p>
        </motion.div>

        {/* Empty State */}
        {savedMovies.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 space-y-5"
          >
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-24 h-24 rounded-3xl glass flex items-center justify-center mx-auto"
            >
              <Film className="w-12 h-12 text-dark-600" />
            </motion.div>
            <p className="text-dark-400">{t('watchlist.empty')}</p>
            <motion.button
              onClick={() => setCurrentPage('chat')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 font-semibold transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Find a Movie
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

        {/* Saved Movies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {savedMovies.map((item: WatchlistItem, i: number) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl overflow-hidden hover:ring-1 hover:ring-primary-500/20 transition-all group"
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={item.movie.posterUrl}
                    alt={item.movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-60" />
                  
                  {/* Remove button */}
                  <motion.button
                    onClick={() => removeFromSaved(item.movie.id)}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-dark-950/60 backdrop-blur-sm text-dark-300 hover:text-red-400 hover:bg-dark-950/80 transition-all opacity-0 group-hover:opacity-100"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>

                  {/* Heart badge */}
                  <div className="absolute top-3 left-3 p-2 rounded-xl bg-red-500/80 backdrop-blur-sm text-white">
                    <Heart className="w-4 h-4 fill-white" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3
                      className="font-bold text-base leading-tight cursor-pointer hover:text-primary-300 transition-colors line-clamp-1"
                      onClick={() => {
                        setSelectedMovie(item.movie);
                        setCurrentPage('movie-detail');
                      }}
                    >
                      {item.movie.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-dark-400 mt-1.5">
                      <span className="flex items-center gap-0.5 text-yellow-400">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        {item.movie.rating}
                      </span>
                      <span>{item.movie.year}</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {item.movie.runtime}m
                      </span>
                    </div>
                  </div>

                  <motion.button
                    onClick={() => {
                      setSelectedMovie(item.movie);
                      setCurrentPage('movie-detail');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary-600/20 hover:bg-primary-600/30 text-primary-300 text-sm font-medium transition-colors"
                    whileTap={{ scale: 0.98 }}
                  >
                    Watch / Download Links
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
