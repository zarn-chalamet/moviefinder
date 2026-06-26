import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import useAppStore from '../store/appStore';
import { mockMovies } from '../data/mockData';

export default function MoviePosterStrip() {
  const { setSelectedMovie, setCurrentPage, t } = useAppStore();
  // duplicate to create seamless loop
  const movies = [...mockMovies, ...mockMovies];

  return (
    <section className="relative py-16 overflow-hidden bg-dark-950">
      {/* Section title */}
      <div className="text-center mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-bold"
        >
          <span className="text-gradient">{t('trending.title')}</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-dark-400 text-sm mt-2"
        >
          {t('trending.subtitle')}
        </motion.p>
      </div>

      {/* Scrolling strip */}
      <div className="relative">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-dark-950 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-dark-950 to-transparent z-10" />

        <motion.div
          className="flex gap-4 px-4"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 40,
              ease: 'linear',
            },
          }}
        >
          {movies.map((movie, i) => (
            <motion.button
              key={`${movie.id}-${i}`}
              onClick={() => {
                setSelectedMovie(movie);
                setCurrentPage('movie-detail');
              }}
              className="flex-shrink-0 group relative w-40 sm:w-48"
              whileHover={{ scale: 1.05, y: -10 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg shadow-black/30 group-hover:shadow-primary-500/20 transition-shadow">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Hover info */}
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                  <p className="text-sm font-bold line-clamp-1">{movie.title}</p>
                  <div className="flex items-center gap-2 text-xs text-dark-300 mt-1">
                    <span className="flex items-center gap-0.5 text-yellow-400">
                      <Star className="w-3 h-3 fill-yellow-400" />
                      {movie.rating}
                    </span>
                    <span>{movie.year}</span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* View all button */}
      <div className="text-center mt-10">
        <motion.button
          onClick={() => setCurrentPage('trending')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass hover:bg-white/5 text-sm font-medium transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          View All Trending Movies
          <span className="text-primary-400">→</span>
        </motion.button>
      </div>
    </section>
  );
}
