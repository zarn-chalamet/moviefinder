import { motion } from 'framer-motion';
import { Star, Clock, Heart, ChevronRight, Play } from 'lucide-react';
import { Movie } from '../types';
import useAppStore from '../store/appStore';

interface MovieCandidatesListProps {
  candidates: Movie[];
  onSelect: (movie: Movie) => void;
  variant?: 'candidates' | 'recommendations';
}

export default function MovieCandidatesList({
  candidates,
  onSelect,
  variant = 'candidates',
}: MovieCandidatesListProps) {
  const { t, isMovieSaved, addToSaved, removeFromSaved } = useAppStore();
  const isRecommendations = variant === 'recommendations';

  return (
    <div className="mt-3 space-y-3">
      {!isRecommendations && (
        <p className="text-xs text-dark-500 font-mono uppercase tracking-widest mb-2">
          {candidates.length} possible matches
        </p>
      )}

      {candidates.map((movie, idx) => {
        const inWatchlist = isMovieSaved(movie.id);

        return (
          <motion.div
            key={`${movie.id}-${idx}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden hover:border-white/10 transition-all"
          >
            <div className="flex gap-4 p-4">
              {/* Poster */}
              {movie.posterUrl ? (
                <button
                  onClick={() => onSelect(movie)}
                  className="w-20 sm:w-24 h-28 sm:h-36 rounded-xl overflow-hidden flex-shrink-0 group"
                >
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </button>
              ) : (
                <div className="w-20 sm:w-24 h-28 sm:h-36 rounded-xl border border-white/5 bg-white/[0.02] flex-shrink-0 flex items-center justify-center">
                  <Play
                    className="w-6 h-6 text-dark-600"
                    strokeWidth={1.5}
                  />
                </div>
              )}

              <div className="flex-1 min-w-0 space-y-2">
                {/* Title */}
                <h3 className="font-semibold text-sm leading-tight tracking-tight">
                  {isRecommendations && (
                    <span className="text-dark-500 font-mono mr-1.5">
                      {idx + 1}.
                    </span>
                  )}
                  {movie.title}
                  {movie.year && (
                    <span className="text-dark-500 font-normal font-mono ml-1.5 text-xs">
                      {movie.year}
                    </span>
                  )}
                </h3>

                {movie.tagline && (
                  <p className="text-xs text-dark-500 italic line-clamp-1">
                    "{movie.tagline}"
                  </p>
                )}

                {/* Meta */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {movie.rating > 0 && (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-3 h-3 fill-yellow-400" />
                      {movie.rating}
                    </span>
                  )}
                  {movie.runtime > 0 && (
                    <span className="text-dark-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {movie.runtime} {t('movie.minutes')}
                    </span>
                  )}
                </div>

                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {movie.genres.slice(0, 3).map((g) => (
                      <span
                        key={g}
                        className="px-2 py-0.5 rounded-full border border-white/5 bg-white/[0.02] text-[10px] text-dark-400"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onSelect(movie)}
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-dark-950 text-xs font-semibold hover:bg-dark-200 transition-colors"
                  >
                    {t('movie.findTitle')}
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <button
                    onClick={() =>
                      inWatchlist
                        ? removeFromSaved(movie.id)
                        : addToSaved(movie)
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                      inWatchlist
                        ? 'border-red-500/30 bg-red-500/10 text-red-400'
                        : 'border-white/10 text-dark-300 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <Heart
                      className={`w-3 h-3 ${inWatchlist ? 'fill-red-400 text-red-400' : ''}`}
                    />
                    {inWatchlist ? t('movie.saved') : t('movie.saveMovie')}
                  </button>
                </div>
              </div>
            </div>

            {/* Overview */}
            {movie.overview && (
              <div className="px-4 pb-4 border-t border-white/5 pt-3">
                <p className="text-xs text-dark-400 leading-relaxed line-clamp-3">
                  {movie.overview}
                </p>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}