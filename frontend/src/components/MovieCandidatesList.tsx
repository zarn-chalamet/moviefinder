import { motion } from 'framer-motion';
import { Star, ChevronRight } from 'lucide-react';
import { Movie } from '../types';

interface MovieCandidatesListProps {
  candidates: Movie[];
  onSelect: (movie: Movie) => void;
}

export default function MovieCandidatesList({ candidates, onSelect }: MovieCandidatesListProps) {
  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs text-dark-400 font-medium mb-2">
        {candidates.length} possible matches - select the correct one:
      </p>
      {candidates.map((movie, idx) => (
        <motion.button
          key={movie.id}
          onClick={() => onSelect(movie)}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="w-full glass rounded-xl p-3 hover:bg-white/5 transition-all group text-left flex gap-3 items-center"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {movie.posterUrl && (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-14 h-20 rounded-lg object-cover flex-shrink-0"
              loading="lazy"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-white truncate">
                  {movie.title}
                  {movie.year && (
                    <span className="text-dark-400 font-normal"> ({movie.year})</span>
                  )}
                </h4>
                {movie.rating > 0 && (
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span className="flex items-center gap-0.5 text-yellow-400">
                      <Star className="w-3 h-3 fill-yellow-400" />
                      {movie.rating}
                    </span>
                    {movie.genres && movie.genres.length > 0 && (
                      <span className="text-dark-400 truncate">
                        {movie.genres.slice(0, 2).join(', ')}
                      </span>
                    )}
                  </div>
                )}
                {movie.overview && (
                  <p className="text-xs text-dark-400 mt-1.5 line-clamp-2">
                    {movie.overview}
                  </p>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-dark-500 group-hover:text-primary-400 transition-colors flex-shrink-0" />
        </motion.button>
      ))}
    </div>
  );
}