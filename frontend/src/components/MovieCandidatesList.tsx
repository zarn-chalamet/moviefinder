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
  variant = 'candidates'
}: MovieCandidatesListProps) {
  const { t, isMovieSaved, addToSaved, removeFromSaved } = useAppStore();
  const isRecommendations = variant === 'recommendations';

  return (
    <div className="mt-3 space-y-3">
      {!isRecommendations && (
        <p className="text-xs text-dark-400 font-medium mb-2">
          {candidates.length} possible matches - select the correct one:
        </p>
      )}
      
      {candidates.map((movie, idx) => {
        const inWatchlist = isMovieSaved(movie.id);
        
        return (
          <motion.div
            key={`${movie.id}-${idx}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="rounded-2xl glass overflow-hidden hover:bg-white/5 transition-all"
          >
            {/* Header: Poster + Basic Info */}
            <div className="flex gap-4 p-4">
              {movie.posterUrl ? (
                <button
                  onClick={() => onSelect(movie)}
                  className="w-24 sm:w-28 h-36 sm:h-40 rounded-xl overflow-hidden flex-shrink-0 shadow-lg group"
                >
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </button>
              ) : (
                <div className="w-24 sm:w-28 h-36 sm:h-40 rounded-xl bg-dark-800 flex-shrink-0 flex items-center justify-center">
                  <Play className="w-8 h-8 text-dark-600" />
                </div>
              )}
              
              <div className="flex-1 min-w-0 space-y-2">
                {/* Title with rank number for recommendations */}
                <div>
                  <h3 className="font-bold text-base sm:text-lg leading-tight">
                    {isRecommendations && (
                      <span className="text-primary-400 mr-1">{idx + 1}.</span>
                    )}
                    {movie.title}
                    {movie.year && (
                      <span className="text-dark-400 font-normal ml-1">
                        ({movie.year})
                      </span>
                    )}
                  </h3>
                  {movie.tagline && (
                    <p className="text-xs text-dark-400 italic mt-0.5 line-clamp-1">
                      "{movie.tagline}"
                    </p>
                  )}
                </div>
                
                {/* Meta info */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {movie.rating > 0 && (
                    <span className="flex items-center gap-1 text-yellow-400 font-medium">
                      <Star className="w-3 h-3 fill-yellow-400" />
                      {movie.rating}
                    </span>
                  )}
                  {movie.runtime > 0 && (
                    <span className="text-dark-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {movie.runtime}min
                    </span>
                  )}
                </div>
                
                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {movie.genres.slice(0, 3).map((g) => (
                      <span 
                        key={g} 
                        className="px-2 py-0.5 rounded-full bg-primary-600/20 text-primary-300 text-xs"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                  <motion.button
                    onClick={() => onSelect(movie)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-600/30 hover:bg-primary-600/50 text-primary-300 text-xs font-medium transition-colors"
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronRight className="w-3 h-3" />
                    Watch/Download Links
                  </motion.button>
                  <motion.button
                    onClick={() => inWatchlist ? removeFromSaved(movie.id) : addToSaved(movie)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      inWatchlist
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-white/5 hover:bg-white/10 text-dark-300'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {inWatchlist ? (
                      <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                    ) : (
                      <Heart className="w-3 h-3" />
                    )}
                    {inWatchlist ? 'Saved' : 'Save'}
                  </motion.button>
                </div>
              </div>
            </div>
            
            {/* Full Overview (shown below the header) */}
            {movie.overview && (
              <div className="px-4 pb-4">
                <p className="text-xs sm:text-sm text-dark-300 leading-relaxed">
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